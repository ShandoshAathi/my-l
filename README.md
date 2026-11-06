# 🌸 Birthday Bloom — Romantic Anime Birthday Surprise

A magical, production-grade, pastel anime-themed birthday surprise web application crafted with React, TypeScript, Tailwind CSS, Three.js, React Three Fiber, Framer Motion, and Supabase.

---

## ✨ Experience Overview

**Birthday Bloom** is an interactive romantic world featuring cherry blossom skies, floating hearts, procedural music, 3D animations, personal polaroid memories, an interactive love letter, a 3D birthday cake with blowable candle flames, and an anime sunset finale.

### Core Sections & Features:
1. **🌸 Dreamy Welcome Screen with 3D Gift Box**
   - Fullscreen anime pink sky with falling sakura petals and floating clouds.
   - Interactive 3D Gift Box built with React Three Fiber.
   - Click "Open Your Surprise" to trigger 3D lid animation, floating heart release, celebratory confetti bursts, and gentle transition into the surprise.
2. **💌 Romantic Introduction**
   - Heartfelt custom birthday intro message and quote card.
   - Anime princess avatar illustration and soft glowing light effects.
3. **📷 Our Memories — Polaroid Gallery**
   - Polaroid-style photo cards with sweet washi tape, gentle tilt angles, and hover glow effects.
   - Dynamic photo loading directly from private Supabase Storage via secure signed URLs.
   - Lightbox modal with previous/next navigation and captions.
   - Elegant fallback demo memories if Supabase photos haven't been uploaded yet.
4. **💫 3D Interactive Photo Carousel**
   - Orbiting 3D memory frames floating in space.
   - Full touch/mouse drag controls to orbit, tilt, and explore.
   - Floating sparkles and soft ambient lighting.
5. **✉️ Interactive Love Letter**
   - 3D-styled pastel pink envelope with a heart wax seal.
   - Click to open: animated flap folds open, letter slides out, and text reveals smoothly.
   - Completely customizable via `src/config/birthdayConfig.ts`.
6. **🎂 3D Birthday Cake & Wish Interaction**
   - Multi-tiered pastel pink birthday cake with cream frosting swirls, strawberries, and candles with glowing flames.
   - Click the cake or "Blow the Candles" button to blow out flames, generate smoke puffs, and release floating wish hearts.
   - Celebratory message: *"May all your beautiful wishes come true. ♡"*
   - "Relight Candles" replay feature.
7. **🌅 Sunset Finale & Surprise Replay**
   - Warm romantic anime sunset scene with cherry blossom breeze.
   - Expressive closing letter from the heart.
   - "Replay My Surprise" button to seamlessly relive the celebration from the top.
8. **🎵 Floating Romantic Music Player**
   - Persistent audio playback across all sections.
   - Play/pause toggle, volume slider, track title, and glowing disc animations.
   - Starts only after user gesture (satisfying browser autoplay policies).
   - Includes procedural Web Audio API backup synthesizer to ensure music is 100% reliable.
9. **🛡️ Dedicated Admin Dashboard (`/admin`)**
   - Secure Supabase Email/Password authentication restricted to `VITE_ADMIN_EMAIL`.
   - Multi-photo upload (JPG, PNG, WEBP, up to 10 MB per image).
   - Instant image preview and caption editing.
   - Stored in a private Supabase Storage bucket (`birthday-private`).
   - Row Level Security (RLS) protects image assets and metadata.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript
- **Routing**: React Router DOM (SPA)
- **Styling**: Tailwind CSS, PostCSS, Custom Pastel Palette
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Animations**: Framer Motion, Canvas Confetti
- **Icons**: Lucide React
- **Backend & Storage**: Supabase (PostgreSQL, Storage, Auth, RLS Policies)
- **Deployment**: Vercel & GitHub

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/birthday-bloom.git
cd birthday-bloom

# Install dependencies
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Populate `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
VITE_ADMIN_EMAIL=your-email@example.com
```

### 4. Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 🔐 Supabase Configuration & Security

To enable photo uploads, secure signed URLs, and administrator authentication, follow these steps:

### Step 1: Create a Supabase Project
1. Log in to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings** -> **API**, copy your `Project URL` and `anon public key`.

### Step 2: Run the SQL Schema
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Copy the entire contents of [`supabase/schema.sql`](./supabase/schema.sql) and paste them into the editor.
3. Click **Run**. This will automatically:
   - Create the `birthday_photos` table with Row Level Security enabled.
   - Configure public `SELECT` policies for gallery visitors.
   - Configure authenticated admin `INSERT`, `UPDATE`, and `DELETE` policies.
   - Create the private `birthday-private` storage bucket (10 MB size limit, image MIME whitelist).
   - Create storage policies allowing secure signed URL generation.

### Step 3: Create the Admin User
1. In Supabase Dashboard, navigate to **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
3. Enter your email (matching `VITE_ADMIN_EMAIL` in `.env`) and a secure password.
4. Toggle "Auto Confirm User" to true.
5. Log in at `http://localhost:5173/admin` to upload your personal photos.

---

## 🎨 Easy Customization

All text, greetings, love letters, and songs can be customized in a single file:

### [`src/config/birthdayConfig.ts`](./src/config/birthdayConfig.ts)
- `recipientName`: Your girlfriend's name or nickname (e.g., *"My Princess"*).
- `birthdayHeading`: Welcome title on the hero screen.
- `introMessage`: The message under the anime portrait.
- `loveLetter`: The paragraph lines of your personal love letter.
- `cakeHeading` & `cakeWishMessage`: The cake wish text.
- `finalMessage`: The heartfelt closing letter.
- `music`: Audio title, artist, and file path.

### Custom Audio File
To replace the background music:
1. Place your MP3 audio file into `public/audio/` (e.g. `public/audio/our-favorite-song.mp3`).
2. Update `music.src` in `src/config/birthdayConfig.ts`:
   ```ts
   music: {
     title: "Our Song",
     artist: "Artist Name",
     src: "/audio/our-favorite-song.mp3"
   }
   ```

---

## 🚢 Deploying to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: Birthday Bloom release"
git branch -M main
git remote add origin https://github.com/your-username/birthday-bloom.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Select your `birthday-bloom` repository.
4. Framework Preset will be automatically detected as **Vite**.

### Step 3: Configure Environment Variables in Vercel
Under the **Environment Variables** section, add:
- `VITE_SUPABASE_URL`: Your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
- `VITE_ADMIN_EMAIL`: Your administrator email

### Step 4: Deploy
Click **Deploy**. Vercel will build the project and issue a free SSL HTTPS link (e.g., `https://birthday-bloom.vercel.app`).

### Step 5: Configure Supabase Auth Redirects
In Supabase Dashboard -> **Authentication** -> **URL Configuration**:
- Set **Site URL** to your Vercel deployment URL (e.g. `https://birthday-bloom.vercel.app`).
- Add `https://birthday-bloom.vercel.app/**` to **Redirect URLs**.

---

## 📱 Mobile & Accessibility Support
- **Touch Gestures**: The 3D Gift Box, 3D Cake, and 3D Photo Orbit are fully responsive and touch-friendly.
- **Adaptive Performance**: Particle counts on mobile are reduced by 50% to conserve battery and GPU resources while maintaining high visual fidelity.
- **Glassmorphism & Color Contrast**: High legibility text on glass panels with soft pastel backgrounds.

---

## 💖 Made with Love
Created for an unforgettable birthday surprise. ♡
