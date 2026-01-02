<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CGG - Am I Cooked?

A social platform for sharing moments of failure, bad luck, and embarrassment. The app uses Google's Gemini AI to analyze submissions and assign a "cooked score" with a sarcastic, Gen Z-style roast.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **AI Integration:** Google Gemini (via `@google/genai`)
- **Icons:** Lucide React
- **State Management:** React Context API

## Run Locally

**Prerequisites:** Node.js 18+ and npm/yarn

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your API keys:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
     CLERK_SECRET_KEY=your_clerk_secret_key
     ```
   - Get your Clerk keys from [clerk.com](https://clerk.com) (create a free account)
   - Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
/
├── app/              # Next.js app directory
│   ├── api/         # API routes (Gemini service)
│   ├── globals.css  # Global styles
│   ├── layout.tsx   # Root layout
│   └── page.tsx     # Home page
├── components/       # React components
├── contexts/         # React contexts (Auth)
├── services/         # Client-side services
├── types.ts          # TypeScript interfaces
└── tailwind.config.ts # Tailwind configuration
```

## Features

- **Feed Viewing:** Browse posts categorized as "Shame" or "At What Cost"
- **AI Analysis:** Every submission is analyzed by Gemini AI
- **Interactions:** Vote, react (F, Skull, W, L), and comment on posts
- **User Profiles:** View stats, history, and rank
- **Video Feed:** TikTok/Reels-style video content view

## Authentication

This app uses [Clerk](https://clerk.com) for authentication. Users can:
- Sign up with email, Google, or other social providers
- Sign in to create posts and interact with content
- View and edit their profiles
- All authentication is handled securely by Clerk

## Migration Notes

This project was migrated from React + Vite to Next.js. All functionality, UI, and styling remain the same. The main changes:

- Components are now client components (marked with `'use client'`)
- Gemini API calls are handled via Next.js API routes (`/api/judge`)
- Routing uses Next.js App Router instead of client-side routing
- Build system changed from Vite to Next.js
- Authentication migrated from mock localStorage to Clerk
