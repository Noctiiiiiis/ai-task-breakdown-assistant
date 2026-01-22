
# AI Task Breakdown Assistant

**Turn vague goals into clear, actionable plans—instantly.**

This project is a minimalist, interview-quality web app designed to help anyone break down complex or unclear goals into step-by-step execution plans. Powered by Google Gemini AI, it provides fast, structured, and practical guidance for students, professionals, and teams.

**Features:**
- Clean, distraction-free interface
- AI-powered breakdowns for any goal or project
- Professional, readable results (card-based UI)
- Responsive design for desktop and mobile
- Secure, production-ready backend

**Use Cases:**
- Planning a new project or assignment
- Preparing for interviews or presentations
- Organizing tasks for personal or team productivity
- Getting unstuck on vague or overwhelming goals

**Tech Stack:**
- Node.js (Express) backend
- React (Vite) frontend
- Google Gemini AI API integration

---


## Structure
- `server`: Express API that handles AI prompt construction
- `client`: React UI (Vite) for presentation only


## Setup

### 1) Server
- Copy `server/.env.example` to `server/.env`
- Set `AI_API_KEY` (optional — if omitted, the API returns a placeholder plan)


### 2) Install dependencies
- `cd server` then install
- `cd client` then install

### 3) Run locally
- Start the server: `npm run dev` in `server`
- Start the client: `npm run dev` in `client`

The client proxies `/api` requests to the server during development.

## Production
1. Build the client: `npm run build` in `client`
2. Start the server with `NODE_ENV=production`

The server will serve the built client from `client/dist`.

## API
- `POST /api/plan` with `{ "goal": "..." }`
- Returns `{ "plan": "..." }`

---

# Deployment & Production

## 1. Prepare for GitHub
- **Never commit your `.env` files.**
- Only commit `.env.example` (no secrets).
- Ensure `.env` is in `.gitignore` (already set).

## 2. Deploy to Vercel
- Push your code to a GitHub repo (e.g. https://github.com/Noctiiiiiis/your-repo-name)
- Import the repo in [Vercel](https://vercel.com/import)
- Set environment variables in the Vercel dashboard (from `.env.example`)
- For the server, set:
	- `AI_API_KEY` (required for Gemini)
	- `AI_MODEL` (e.g. `gemini-2.5-flash`)
	- `NODE_ENV=production`
	- `PORT=3001` (or as needed)

## 3. Environment Variables
- **server/.env.example** documents all required variables
- Never share your real API keys

## 4. Local Development
- Copy `.env.example` to `.env` and fill in your values
- Run as described above
