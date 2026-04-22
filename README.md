# AI-Driven Communication System - A Chatting App 🚀

A high-performance, professional full-stack communication platform featuring state-of-the-art AI integration and a premium "Cinema Mode" dashboard.

![Premium UI Showcase](./demo_recording.webp)

## ✨ Premium Features

### 🎬 Professional 'Cinema Mode' Layout
- **Full-Screen Immersive Workspace**: Optimized for focused professional communication.
- **Glassmorphism Design System**: Sleek, modern aesthetics with backdrop-blur effects and dynamic mesh gradients.
- **Responsive Architecture**: Gracefully adapts from compact sidebars to full-width desktop dashboards.

### 🧠 Gemini AI Suite
- **Smart Suggestions**: Context-aware, 3-pill reply recommendations generated in real-time based on discussion history.
- **Conversation Summarization**: One-click AI recaps that distill long chat histories into professional 1-2 sentence summaries.
- **Relevant Insights**: AI responses are strictly tuned to the current API data and communication context.

### ⚡ Real-Time Infrastructure
- **Socket.IO Sync**: Instant, low-latency message delivery and online status tracking.
- **Cloudinary Media Engine**: Persistent, high-fidelity image storage and sharing.
- **MongoDB Persistence**: Reliable data storage for all chat history and user profiles.

### 🎨 Advanced UX & Customization
- **Theme Engine**: Seamlessly switch between multiple professional themes (Luxury, Coffee, Retro, etc.).
- **Secure Auth**: Robust JWT-based authentication and authorization.
- **Privacy First**: All branding ("Chatty") has been purified for a white-label, professional feel.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, DaisyUI, Zustand, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-Time**: Socket.IO
- **AI**: Google Gemini AI (1.5 Flash)
- **Storage**: Cloudinary

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/Chandrashekar0123/AI-Driven-Communication-System---A-Chatting-App.git
```

### 2. Environment Setup
Create a `.env` file in the `backend` directory:
```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Run the Application
```bash
# Run backend (from /backend)
npm run dev

# Run frontend (from /frontend)
npm run dev
```

## 🎥 Demo
Check the `demo_recording.webp` file in the root directory for a full walkthrough of the Seshu Kumar vs. Chandu real-time AI messaging flow.

---
Built with ❤️ by AI-Driven Communication Team.
