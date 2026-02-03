'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Code2, ArrowRight, Terminal, Lock, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [isJoin, setIsJoin] = useState(false)

  // Interactive Mouse Gradient State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim()) return

    const targetRoomId = isJoin ? roomId.trim() : uuidv4()
    if (!targetRoomId) return

    const params = new URLSearchParams()
    params.set('name', userName)
    if (password) params.set('password', password)

    router.push(`/room/${targetRoomId}?${params.toString()}`)
  }

  // Typewriter Code Animation
  const codeLines = [
    { text: "import React from 'react'", color: "text-emerald-700" },
    { text: "function App() {", color: "text-blue-800" },
    { text: "  return <h1>Hello World</h1>", color: "text-gray-700" },
    { text: "}", color: "text-gray-600" }
  ]

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 flex flex-col relative overflow-hidden bg-dot-pattern">

      {/* Interactive Cursor Gradient Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 opacity-20"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.15), transparent 40%)`
        }}
      />

      {/* Function-focused Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20"
      >
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
          >
            <Code2 className="w-5 h-5 text-black" />
          </motion.div>
          <span className="font-bold text-xl tracking-tight">CodeCollab</span>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 pb-12">

        {/* Left: Interactive Typography */}
        <div className="flex flex-col justify-center space-y-4">
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9]">
            <motion.span
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              whileHover={{ scale: 1.05, x: 20 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 block cursor-default"
            >
              Code.
            </motion.span>
            <motion.span
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              whileHover={{ scale: 1.05, x: 20 }}
              className="text-white block cursor-default hover:text-gray-200 transition-colors"
            >
              Editor.
            </motion.span>
            <motion.span
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              whileHover={{ scale: 1.05, x: 20 }}
              className="text-white block cursor-default hover:text-gray-200 transition-colors"
            >
              Deploy.
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-lg max-w-md mt-4 font-mono group"
          >
            <span className="text-emerald-500 group-hover:text-emerald-400 transition-colors">{`//`}</span> Initialize instant <span className="text-white group-hover:underline decoration-emerald-500 underline-offset-4 cursor-pointer">collaborative</span> development environments.
          </motion.p>
        </div>

        {/* Right: Functional Interface */}
        <div className="relative perspective-1000">
          {/* Animated Blobs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-40"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: 5 }}
            className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl opacity-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            whileHover={{ scale: 1.02 }}
            className="bg-[#0a0a0a] border border-gray-800/80 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:border-emerald-500/30 group"
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">Session Protocol</h2>
              <p className="text-gray-500 text-xs uppercase tracking-widest">Secure Environment Access</p>
            </div>

            {/* Toggle */}
            <div className="flex bg-gray-900/80 p-1 rounded-lg mb-6 border border-gray-800/50">
              <button onClick={() => setIsJoin(false)} className={cn("flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300", !isJoin ? "bg-gray-800 text-white shadow-sm ring-1 ring-white/5 scale-105" : "text-gray-500 hover:text-gray-300")}>New Session</button>
              <button onClick={() => setIsJoin(true)} className={cn("flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-300", isJoin ? "bg-gray-800 text-white shadow-sm ring-1 ring-white/5 scale-105" : "text-gray-500 hover:text-gray-300")}>Join Session</button>
            </div>

            {/* Form */}
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Developer Alias</label>
                <div className="relative group/input">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/input:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-[#111] border border-gray-800/80 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm group-hover/input:border-gray-700"
                    placeholder="username"
                  />
                </div>
              </div>

              {isJoin && (
                <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Session ID</label>
                  <div className="relative group/input">
                    <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/input:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="w-full bg-[#111] border border-gray-800/80 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm group-hover/input:border-gray-700"
                      placeholder="uuid-v4"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between pl-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Access Key</label>
                  <span className="text-[10px] text-gray-600">(Optional)</span>
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within/input:text-emerald-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111] border border-gray-800/80 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm group-hover/input:border-gray-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                className="w-full bg-white hover:bg-emerald-50 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                {isJoin ? 'Connect' : 'Initialize'} <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </main>

      {/* Laptop Mockup with Typing Animation */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="w-full max-w-5xl mx-auto px-6 relative z-10 mt-auto overflow-hidden h-[120px]"
      >
        <div className="w-full h-[400px] bg-[#0c0c0c] border border-gray-800 rounded-t-2xl shadow-2xl relative left-0 top-0 opacity-80 hover:opacity-100 transition-opacity duration-500">
          <div className="h-6 bg-[#1a1a1a] border-b border-gray-800 rounded-t-2xl flex items-center px-4 gap-2">
            <div className="flex gap-1.5 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
          </div>
          <div className="p-4 font-mono text-[10px] text-gray-600">
            {/* Simulated Typing Code */}
            {codeLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + (i * 0.5) }}
                className={line.color}
              >
                {line.text}
              </motion.p>
            ))}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-1.5 h-3 bg-emerald-500 mt-1"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </div>
  )
}
