# CodeCollab - Real-time Collaborative Code Editor

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.0-white)

CodeCollab is a powerful online code editor that enables real-time collaboration, code execution, and video communication. Built for developers and students to code together seamlessly.

## 🚀 Features

- **Real-time Collaboration**: Code synchronizes instantly between all users in a room.
- **Multi-language Support**: JavaScript, Python, Java, C++, and more.
- **Code Execution**: Run code directly in the browser and see output instantly.
- **Video & Audio Chat**: Built-in WebRTC video chat for seamless communication.
- **Cursor Tracking**: See where others are typing in real-time.
- **Modern UI**: Clean, dark-mode interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Monaco Editor
- **State Management**: Zustand
- **Backend**: Node.js, Express, Socket.io
- **Real-time**: WebSockets, WebRTC (SimplePeer)
- **Execution**: Node.js Child Processes

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codecollab.git
   cd codecollab
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd collab-code-editor
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd collab-code-editor/server
   npm install
   ```

## 🏃‍♂️ Usage

1. **Start the Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:3001`

2. **Start the Frontend Application**
   ```bash
   # In collab-code-editor root
   npm run dev
   ```
   App runs on `http://localhost:3000`

3. **Open in Browser**
   - Go to `http://localhost:3000`
   - Enter your name and create a room
   - Share the Room ID with friends!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
