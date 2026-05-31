/**
 * Seed SEO-optimised blog posts that cross-link the ElectroLab course & tools.
 *
 *   cd backend && node scripts/seedBlogs.js
 *
 * Idempotent: upserts by slug, so you can re-run it safely after editing copy.
 * Requires MONGODB_URI in backend/.env (the same DB the live site uses).
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const Blog = require('../models/Blog');

const SITE = 'https://electrophobia.tech';
const img = (name) => `${SITE}/img/lab/${name}.jpg`;

const posts = [
  {
    title: 'Learn Electronics for Free: The 5-Day ElectroPhobia Bootcamp',
    slug: 'learn-electronics-free-5-day-bootcamp',
    category: 'Tutorials',
    readTime: '6 min read',
    featured: true,
    imageUrl: img('breadboard'),
    tags: ['learn electronics', 'robotics', 'Arduino', 'ESP32', 'free course', 'beginners'],
    excerpt:
      'A free, structured 5-day electronics & robotics course — from voltage and Ohm’s Law to sensors, motors, communication protocols and PCB design. No hardware needed.',
    content: `Want to learn electronics but don't know where to start? We built a **completely free, structured course** inside our interactive [ElectroLab](${SITE}/lab) — and you can read it, present it, or follow along right in your browser.

## What the bootcamp covers

The [5-day course](${SITE}/lab/course) is compressed into focused days, each a clean slide deck with animations and real component photos:

- **[Day 1 — Foundations & Components](${SITE}/lab/course/day-1):** robotics, electricity, Ohm's Law, the multimeter, breadboard, and the resistor/capacitor/inductor trio.
- **[Day 2 — Logic & Circuits](${SITE}/lab/course/day-2):** series/parallel, binary, logic gates — even how transistors build NOT, NOR and NAND gates.
- **[Day 3 — Embedded Programming](${SITE}/lab/course/day-3):** Arduino/ESP32, the IDE, \`setup()\`/\`loop()\`, PWM, and reading sensors.
- **[Day 4 — Sensors & Motors](${SITE}/lab/course/day-4):** LDR, IR, a line-following robot, motor drivers, servos, ultrasonic distance and Bluetooth.
- **[Day 5 — Power, Control & Communication](${SITE}/lab/course/day-5):** regulators, batteries, PID control, and UART/SPI/I²C.

There's also a full **[PCB design track in KiCad](${SITE}/lab/course/kicad)** that takes you from schematic to a board you can order.

## Why it's different

Every concept has both an **animated diagram** (showing *how* it works) and a **real photo** (showing *what it looks like*). And the theory links straight to free [interactive tools](${SITE}/lab/tools) so you can try the numbers yourself.

> Ready to start? Open [Day 1](${SITE}/lab/course/day-1) — no sign-up, no hardware, all in your browser.`,
  },
  {
    title: 'Resistor Color Code Explained (with a Free Online Decoder)',
    slug: 'resistor-color-code-explained',
    category: 'Tutorials',
    readTime: '4 min read',
    featured: false,
    imageUrl: img('resistors'),
    tags: ['resistor color code', 'resistor calculator', 'electronics basics', 'beginners'],
    excerpt:
      'Resistors do not print their value — they wear coloured bands. Learn to read them in 2 minutes and decode any resistor with our free tool.',
    content: `Resistors don't print their value on the body. Instead they wear **coloured bands** that encode it. Here's the quick version.

## How the bands work

For a standard 4-band resistor:

1. **1st band** — first digit
2. **2nd band** — second digit
3. **3rd band** — multiplier (×10ⁿ)
4. **4th band** — tolerance (gold = ±5%)

So **Red–Red–Brown** = 2, 2, ×10 = **220 Ω**. **Brown–Black–Red** = 1, 0, ×100 = **1 kΩ**.

## Don't memorise — decode

Instead of memorising the chart, use our free **[Resistor Color-Code decoder](${SITE}/lab/tools/resistor)** — click the bands and read the value instantly (and the reverse, value → bands).

You'll meet resistors on [Day 1 of the course](${SITE}/lab/course/day-1), and you'll use this exact skill when picking a current-limiting resistor for an LED — for that, try the [LED resistor calculator](${SITE}/lab/tools/led-calc).`,
  },
  {
    title: "Ohm's Law Made Simple: V = I × R (with a Calculator)",
    slug: 'ohms-law-explained',
    category: 'Tutorials',
    readTime: '4 min read',
    featured: false,
    imageUrl: img('multimeter'),
    tags: ['ohms law', 'V=IR', 'electronics basics', 'voltage current resistance'],
    excerpt:
      'Voltage pushes, current flows, resistance opposes. Master the one equation behind every circuit — and solve it instantly with our free calculator.',
    content: `If you learn one equation in electronics, make it **Ohm's Law**:

> **V = I × R**

- **V** — voltage (volts), the "push"
- **I** — current (amps), the "flow"
- **R** — resistance (ohms), the "opposition"

Rearrange it three ways: **V = I·R**, **I = V/R**, **R = V/I**. The [Ohm's Law triangle on Day 1](${SITE}/lab/course/day-1) makes this visual — cover the value you want and the formula appears.

## Try real numbers

Don't do the arithmetic by hand — our free **[Ohm's Law calculator](${SITE}/lab/tools/ohms-law)** solves for any value and the power too. Pair it with a [multimeter](${SITE}/lab/course/day-1) to measure voltage and current on a real circuit.`,
  },
  {
    title: 'How to Choose an LED Resistor (Free Calculator Inside)',
    slug: 'led-resistor-calculator-guide',
    category: 'Tutorials',
    readTime: '4 min read',
    featured: false,
    imageUrl: img('led'),
    tags: ['LED resistor', 'current limiting resistor', 'Arduino LED', 'electronics basics'],
    excerpt:
      'Connect an LED without a resistor and it burns out in seconds. Here is the formula — and a free calculator that picks the right resistor for you.',
    content: `An LED is a diode: give it too much current and it dies instantly. That's why every LED needs a **current-limiting resistor**.

## The formula

> **R = (V_supply − V_LED) / I_LED**

For a red LED (~2 V) on 5 V at 10 mA: (5 − 2) / 0.01 = **300 Ω → use 330 Ω**.

Different colours have different forward voltages (red ≈ 2 V, blue/white ≈ 3 V), so the resistor changes too.

## Skip the math

Our free **[LED resistor calculator](${SITE}/lab/tools/led-calc)** picks the exact resistor (and the nearest standard value) for any LED colour and supply voltage. You'll use this constantly once you start [programming an Arduino or ESP32](${SITE}/lab/course/day-3).`,
  },
  {
    title: 'Voltage Dividers for Sensors: The Beginner’s Guide',
    slug: 'voltage-divider-for-sensors',
    category: 'Tutorials',
    readTime: '5 min read',
    featured: false,
    imageUrl: img('ldr'),
    tags: ['voltage divider', 'sensors', 'LDR', 'analog read', 'ESP32'],
    excerpt:
      'Most sensors change resistance. A voltage divider turns that into a voltage your microcontroller can read. Here is how — with a free calculator.',
    content: `Many beginner sensors — like an **LDR** (light sensor) or a thermistor — don't output a voltage, they change **resistance**. To read them with a microcontroller you convert that resistance into a voltage using a **voltage divider**.

## The idea

Two resistors in series split the input voltage:

> **Vout = Vin × R2 / (R1 + R2)**

Put your sensor as one of the resistors, and **Vout moves as the sensor changes** — perfect for an ADC pin like on the ESP32.

## Calculate it instantly

Use our free **[Voltage Divider calculator](${SITE}/lab/tools/voltage-divider)** to find Vout, the current, and power for any R1/R2. Then see it in context on [Day 4 — Sensors & Motors](${SITE}/lab/course/day-4), where we read an LDR and IR sensor.`,
  },
  {
    title: 'Build a Line-Following Robot with IR Sensors',
    slug: 'build-line-following-robot-ir',
    category: 'Project Guides',
    readTime: '6 min read',
    featured: true,
    imageUrl: img('l298n'),
    tags: ['line follower robot', 'IR sensor', 'Arduino robot', 'beginner robotics project'],
    excerpt:
      'The classic first robot: a car that drives itself along a black line using IR sensors. Here is how it works and how to build one.',
    content: `A **line-following robot** is the perfect first robotics project — it ties together sensors, motors and a little logic.

## How it works

IR sensors point at the floor. A **white surface reflects** the infrared back (detected); a **black line absorbs** it (not detected). By reading which sensors see the line, the robot knows where the line is and steers to stay centred. We animate exactly this on [Day 4 of the course](${SITE}/lab/course/day-4).

## What you need

- A microcontroller — [Arduino or ESP32](${SITE}/lab/course/day-3)
- 2+ **IR sensors** for the line
- A **motor driver** (L298N) + two DC motors — never drive motors straight from a pin
- A chassis, wheels and a battery

## The logic

1. Read the IR sensors.
2. Both see white → drive straight.
3. Left sensor hits the black line → steer left; right sensor → steer right.
4. Loop fast for smooth following.

Want the fundamentals first? Start with [sensors and motors on Day 4](${SITE}/lab/course/day-4), and brush up on [motor drivers and PWM](${SITE}/lab/course/day-4). Then explore the full [free course](${SITE}/lab/course).`,
  },
];

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set. Add it to backend/.env first.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  for (const p of posts) {
    await Blog.findOneAndUpdate(
      { slug: p.slug },
      {
        ...p,
        author: 'ElectroPhobia Team',
        isPublished: true,
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`  ✓ upserted: ${p.slug}`);
  }

  console.log(`\n🎉 Seeded ${posts.length} blog posts.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
