/**
 * Create (or update) an admin account. This replaces the old public
 * /api/auth/register endpoint, which let anyone on the internet mint an admin.
 *
 * Usage:
 *   cd backend && node scripts/createAdmin.js <email> <password> "<name>" [role]
 *   # role is optional: "admin" (default) or "superadmin"
 *
 * Or via env vars (handy for CI / one-off shells that don't want the password
 * in shell history):
 *   ADMIN_EMAIL=you@site.com ADMIN_PASSWORD=... ADMIN_NAME="You" \
 *     node scripts/createAdmin.js
 *
 * Idempotent: if the email already exists, its password/name/role are updated.
 * Requires MONGODB_URI in backend/.env (the same DB the live site uses).
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const Admin = require('../models/Admin');

async function run() {
  const email = (process.argv[2] || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.argv[3] || process.env.ADMIN_PASSWORD || '';
  const name = process.argv[4] || process.env.ADMIN_NAME || '';
  const role = process.argv[5] || process.env.ADMIN_ROLE || 'admin';

  if (!email || !password || !name) {
    console.error('Usage: node scripts/createAdmin.js <email> <password> "<name>" [role]');
    console.error('   or set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME env vars.');
    process.exit(1);
  }
  if (!['admin', 'superadmin'].includes(role)) {
    console.error(`❌ Invalid role "${role}". Use "admin" or "superadmin".`);
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters.');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set. Add it to backend/.env first.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await Admin.findOne({ email });
  const admin = await Admin.findOneAndUpdate(
    { email },
    { email, password: hashedPassword, name, role },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  console.log(`${existing ? '🔁 updated' : '🎉 created'} admin: ${admin.email} (${admin.role})`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed to create admin:', err);
  process.exit(1);
});
