# 🎙️ VoiceFlow

**Transform your voice into actionable tasks, summaries, and calendar events — powered by AI.**

VoiceFlow is a dark-themed productivity web app that lets you record or upload voice notes and automatically extracts:
- ✅ **Actionable tasks** with priorities
- 📝 **Concise summaries** of what you said
- 📅 **Calendar events** with dates, times, and locations (exportable to any calendar app)

Stop typing. Just talk.

---

## ✨ Features

- 🎤 **Live voice recording** directly in the browser
- 📁 **Audio file upload** (MP3, WAV, M4A, WebM)
- 🤖 **AI-powered transcription** via ElevenLabs Speech-to-Text
- 🧠 **Smart extraction** of tasks, summaries, and events using Google Gemini
- ✅ **Task management** with priorities and completion tracking
- 📅 **Calendar export** as `.ics` files (works with Google Calendar, Outlook, Apple Calendar)
- 🔐 **Secure user authentication** with email/password
- 🌙 **Dark professional UI** with teal accents

---

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui components
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **AI/Transcription:** ElevenLabs STT + Google Gemini via Lovable AI Gateway
- **Routing:** React Router
- **State/Data:** TanStack Query

---

## 📸 How It Works

1. **Sign up** for a free account
2. **Record** a voice note or **upload** an audio file
3. **AI processes** your audio — transcribes it and extracts key information
4. **Review** your summary, tasks, and calendar events
5. **Export** events to your favorite calendar app or manage tasks in-app

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- A Supabase project (or use Lovable Cloud)
- An ElevenLabs API key
- A Lovable AI Gateway key (or your own Gemini key)

### Setup

```sh
# 1. Clone the repository
git clone https://github.com/saniasirohi226/voiceflow.git
cd voiceflow

# 2. Install dependencies
npm install

# 3. Create a .env file with your keys
cp .env.example .env
# Then fill in your Supabase URL, anon key, and any API keys

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:8080`.

---

## 🔑 Environment Variables

Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

Edge function secrets (set via Supabase dashboard):
- `ELEVENLABS_API_KEY` — for speech-to-text
- `LOVABLE_API_KEY` — for AI extraction (or use your own OpenAI/Gemini setup)

---

## 📂 Project Structure

```
├── src/
│   ├── components/       # Reusable UI components (VoiceRecorder, FileUploader, etc.)
│   ├── pages/            # Route pages (Landing, Login, Dashboard, Tasks, etc.)
│   ├── hooks/            # Custom React hooks (useAuth)
│   ├── integrations/     # Supabase client
│   └── lib/              # Utility functions
├── supabase/
│   ├── functions/
│   │   ├── transcribe-audio/    # ElevenLabs STT edge function
│   │   └── process-transcript/  # AI extraction edge function
│   └── config.toml
└── public/
```

---

## 🗄️ Database Schema

- **profiles** — user profile data
- **voice_notes** — transcripts and summaries
- **tasks** — extracted tasks linked to voice notes
- **calendar_events** — extracted events linked to voice notes

All tables use Row-Level Security (RLS) — users can only access their own data.

---

## 🚢 Deployment

Deploy easily via [Lovable](https://lovable.dev):
1. Open the project in Lovable
2. Click **Share → Publish**

Or self-host: build with `npm run build` and deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

MIT © [Sania Sirohi](https://github.com/saniasirohi226)

---

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- Transcription by [ElevenLabs](https://elevenlabs.io)
- AI processing via [Google Gemini](https://ai.google.dev)
