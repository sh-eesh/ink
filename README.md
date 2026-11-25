
# Ink

A simple notes app.

**[Try Ink](https://ink-good-notes.vercel.app/)**

## Features

- Sign up and log in
- Create, edit, and delete notes
- Pin important notes
- Archive and restore notes
- Search notes by title or content
- Private notes for each user

## Running locally

You'll need Node.js and a Supabase project.

### Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
PORT=5000
```

Start the backend:

```bash
npm run dev
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.
 
