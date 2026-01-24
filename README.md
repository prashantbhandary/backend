# ElectroPhobia Backend API

Backend server for ElectroPhobia website with MongoDB database and RESTful APIs.

## 🚀 Setup Instructions

### 1. Install MongoDB

Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)

Or use MongoDB Atlas (cloud database): [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

Create a `.env` file in the backend folder:

```bash
cp .env.example .env
```

Edit `.env` and update the values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/electrophobia
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 4. Create Initial Admin Account

Start the server first:

```bash
npm run dev
```

Then register the first admin using POST request to `/api/auth/register`:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@electrophobia.com",
    "password": "admin123",
    "name": "Admin"
  }'
```

Or use the admin login page at `http://localhost:3000/admin/login`

### 5. API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current admin (requires token)

#### Experiences
- `GET /api/experiences` - Get all experiences
- `GET /api/experiences/:id` - Get single experience
- `POST /api/experiences` - Create experience (admin only)
- `PUT /api/experiences/:id` - Update experience (admin only)
- `DELETE /api/experiences/:id` - Delete experience (admin only)

#### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (admin only)
- `PUT /api/projects/:id` - Update project (admin only)
- `DELETE /api/projects/:id` - Delete project (admin only)

#### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/slug/:slug` - Get blog by slug
- `GET /api/blogs/:id` - Get blog by ID
- `POST /api/blogs` - Create blog (admin only)
- `PUT /api/blogs/:id` - Update blog (admin only)
- `DELETE /api/blogs/:id` - Delete blog (admin only)

## 📁 Project Structure

```
backend/
├── models/          # MongoDB schemas
│   ├── Admin.js
│   ├── Experience.js
│   ├── Project.js
│   └── Blog.js
├── routes/          # API routes
│   ├── auth.js
│   ├── experiences.js
│   ├── projects.js
│   └── blogs.js
├── middleware/      # Custom middleware
│   └── auth.js
├── .env             # Environment variables
├── .env.example     # Environment template
├── server.js        # Main server file
└── package.json     # Dependencies
```

## 🔒 Authentication

All admin endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

Get the token by logging in through `/api/auth/login`

## 🛠️ Development

```bash
npm run dev   # Start with nodemon (auto-reload)
npm start     # Start production server
```

## 📝 Notes

- The first admin account should be created using `/api/auth/register`
- After that, you can disable the register endpoint in production
- All timestamps are automatically managed by MongoDB
- Blog slugs are auto-generated from titles
- Images can be uploaded to the `/uploads` directory (not yet implemented)
