# AI-Driven Communication System - A Chatting App 🚀

A high-performance, professional full-stack communication platform featuring state-of-the-art AI integration and a premium "Cinema Mode" dashboard.

## ✨ Premium Features

### 🎬 Professional 'Cinema Mode' Layout
- **Full-Screen Immersive Workspace**: Optimized for focused professional communication.
- **Glassmorphism Design System**: Sleek, modern aesthetics with backdrop-blur effects and dynamic mesh gradients.
- **Responsive Architecture**: Gracefully adapts from compact sidebars to full-width desktop dashboards.

### 🧠 Multi-Provider AI Engine
Powered by an intelligent cascade of **Gemini 2.5/2.0**, **HuggingFace**, and **OpenAI GPT-3.5**:
- **Smart Auto-Replies**: Context-aware, 3-pill reply recommendations generated in real-time.
- **Voice Messages (STT)**: Built-in Speech-to-Text via Web Speech API and HuggingFace Whisper.
- **Text-to-Speech (TTS)**: Listen to any message with built-in native TTS.
- **Magic AI Hub (12 Features)**:
  - Summarize conversations
  - Sentiment & Emotion analysis
  - Extract Action Items / Tasks
  - Keyphrase Extraction
  - Translate to English
  - Tone Rewriting
  - Grammar Correction
  - Smart Search & Spam Moderation
  - Emoji Suggestions

### 💬 Real-Time Full-Stack Core
- **Real-Time Engine**: Built with Socket.io for instantaneous message delivery and typing indicators.
- **Secure Authentication**: JWT-based auth with encrypted credentials.
- **Global State Management**: Powered by Zustand for lightning-fast UI updates.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite), TailwindCSS, Zustand, Lucide Icons, React Router
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **AI Models**: Google Gemini 2.5 Flash, Gemini 2.0 Flash Lite, HuggingFace Inference API, OpenAI

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory (see `backend/.env.example`):
```env
PORT=5001
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AI Keys
GOOGLE_API_KEY=your_gemini_key
HUGGINGFACE_API_KEY=your_hf_key
OPENAI_API_KEY=your_openai_key
```

Create a `.env` file in the `frontend` directory:
```env
VITE_HUGGINGFACE_API_KEY=your_hf_key
```

### 3. Run the Application
```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

---

## 🔒 Security
- All sensitive API keys are stored in `.env` and ignored via `.gitignore`.
- Intelligent rate-limit handling prevents API abuse.
- Local rule-based AI fallback ensures the app never crashes even if external APIs are exhausted.

## 🎥 Demo
Check the `demo_recording.webp` file in the root directory for a full walkthrough of the Seshu Kumar vs. Chandu real-time AI messaging flow.

---
Built with ❤️ by AI-Driven Communication Team.
