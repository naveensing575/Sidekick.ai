# 🤖 Sidekick AI

A **Next.js (App Router)** based multi-chat AI assistant app (like ChatGPT), deployed on **Vercel**, styled with **Tailwind** (blue/slate theme), and powered by **OpenRouter AI streaming API**.  
Chats are persisted locally with **Dexie.js (IndexedDB)** and enhanced with **Framer Motion animations** for smooth typing effects.

---

## 🚀 Features

- **Multi-chat sessions** — switch between conversations easily  
- **Persistent storage** — chats/messages saved with Dexie.js (IndexedDB)  
- **Streaming AI responses** — powered by OpenRouter API  
- **AI auto-generated chat titles** (2–4 words, concise)  
- **Framer Motion animations** — smooth fade & typing animation for latest AI response  
- **Sidebar management** — rename & delete chats instantly  
- **Tailwind UI** — clean dark theme with blue/slate palette  
- **PWA-ready** — install as an app via `next-pwa`  
- **Deployed on Vercel**  

---

## 🏗️ Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS  
- **Database**: Dexie.js (IndexedDB)  
- **AI API**: OpenRouter (streaming)  
- **Animations**: Framer Motion  
- **Deployment**: Vercel  
- **PWA**: next-pwa  

---

## 📂 Project Structure

```
/src
 ├── app/
 │   ├── api/chat/route.ts    # AI streaming API route
 │   └── page.tsx             # Main entry
 ├── components/
 │   ├── ChatWindow.tsx       # Main chat window
 │   ├── Sidebar.tsx          # Sidebar with chat sessions
 │   ├── MessageList.tsx      # Renders messages list
 │   └── InputBox.tsx         # Chat input box
 ├── lib/
 │   ├── db.ts                # Dexie setup
 │   └── ai.ts                # streamChat + generateTitle helpers
```

---

## ⚡ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/sidekick-ai.git
cd sidekick-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env.local` file:

```bash
OPENROUTER_API_KEY=your_api_key_here
```

### 4. Run locally

```bash
npm run dev
```

App runs at: **http://localhost:3000**

### 5. Build & Deploy

```bash
npm run build
npm start
```

Deployed on **Vercel** (auto from GitHub recommended).

---

## ✅ Completed Work

- Project structure with App Router  
- Dexie.js persistence for chats  
- OpenRouter streaming integration  
- Auto chat title generation  
- Framer Motion animations for assistant responses  
- Sidebar rename/delete  
- Tailwind blue/slate theme  
- PWA setup (`next-pwa`)  
- Deployment on Vercel fixed (no blank screen issue)  

---

## 🔧 Next Improvements

- [ ] Add AbortController cleanup for streaming  
- [ ] Show error states in UI for failed responses  
- [ ] Add settings (theme toggle, model selection)  
- [ ] User auth & sync chats  
- [ ] Export chats to Markdown/PDF  

---

## 📜 License

MIT © 2025 — Sidekick AI
