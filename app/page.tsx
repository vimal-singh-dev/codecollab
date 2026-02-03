'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Code2, ArrowRight, Terminal, Lock, Users, Play, Zap, Shield, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const [roomId, setRoomId] = useState('')
  const [userName, setUserName] = useState('')
  const [isJoin, setIsJoin] = useState(false)
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

    router.push(`/room/${targetRoomId}?${params.toString()}`)
  }

  const features = [
    { icon: Code2, title: 'VS Code–like UI', desc: 'Familiar interface, zero learning curve', category: 'editor' },
    { icon: Globe, title: 'Multi-language', desc: '8 languages supported', category: 'editor' },
    { icon: Zap, title: 'Cursor sync', desc: 'See collaborators type in real-time', category: 'editor' },
    { icon: Users, title: 'Room-based', desc: 'Private collaborative workspaces', category: 'collab' },
    { icon: Terminal, title: 'Group chat', desc: 'Built-in team messaging', category: 'collab' },
    { icon: Play, title: 'Video calls', desc: 'Integrated voice & screen sharing', category: 'comm' }
  ]

  return (
    <div className="min-h-screen bg-hacker-bg text-white font-sans selection:bg-hacker-emerald selection:text-black flex flex-col relative overflow-hidden">

      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-hacker-emerald/5 via-transparent to-transparent opacity-40" />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-30 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 136, 0.08), transparent 60%)`
        }}
      />

      {/* Refined Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20 relative">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2.5 bg-gradient-to-br from-hacker-emerald/20 to-hacker-emerald/5 rounded-xl border border-hacker-emerald/30 shadow-lg shadow-hacker-emerald/5">
            <Terminal className="w-5 h-5 text-hacker-emerald" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight leading-none text-white">CodeCollab</span>
            <span className="text-[9px] text-hacker-emerald/80 font-mono tracking-[0.2em] uppercase">Squad Edition</span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center gap-2 text-xs font-mono text-hacker-muted"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-hacker-emerald animate-pulse" />
          <span className="uppercase tracking-wider">Live</span>
        </motion.div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10 pb-16 lg:pb-20">

        {/* Enhanced Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
              Code together.
              <br />
              Talk together.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-hacker-emerald via-emerald-400 to-hacker-emerald animate-gradient">
                Ship faster.
              </span>
            </h1>
            <p className="text-hacker-muted text-lg lg:text-xl max-w-lg leading-relaxed">
              A VS Code–like online editor with real-time collaboration, group chat, and video calls. <span className="text-white font-medium">No setup. Just a link.</span>
            </p>
          </div>

          {/* Feature Pills - 6 concrete features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center gap-2 px-3 py-2 bg-hacker-panel/50 border border-hacker-border rounded-lg hover:border-hacker-emerald/30 transition-all group cursor-default"
              >
                <feature.icon className="w-4 h-4 text-hacker-emerald flex-shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-white truncate">{feature.title}</span>
                  <span className="text-[10px] text-hacker-muted truncate">{feature.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Premium Glass Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-full max-w-md mx-auto lg:mr-0"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-hacker-emerald/20 to-emerald-600/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000" />

          <div className="relative glass-panel p-8 rounded-2xl border border-hacker-emerald/20 shadow-2xl shadow-hacker-emerald/5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-hacker-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-hacker-emerald shadow-lg shadow-hacker-emerald/50 animate-pulse" />
                <h2 className="text-lg font-bold text-white tracking-wide uppercase font-mono">Initialize</h2>
              </div>
              <div className="text-[10px] text-hacker-muted font-mono uppercase tracking-wider">Secure</div>
            </div>

            <form onSubmit={handleJoin} className="space-y-5">
              {/* Premium Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-hacker-bg/80 rounded-xl border border-hacker-border/50">
                <button
                  type="button"
                  onClick={() => setIsJoin(false)}
                  className={cn(
                    "py-2.5 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all duration-300",
                    !isJoin
                      ? "bg-gradient-to-br from-hacker-emerald to-emerald-600 text-black shadow-lg shadow-hacker-emerald/25"
                      : "text-hacker-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  New Room
                </button>
                <button
                  type="button"
                  onClick={() => setIsJoin(true)}
                  className={cn(
                    "py-2.5 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-all duration-300",
                    isJoin
                      ? "bg-gradient-to-br from-hacker-emerald to-emerald-600 text-black shadow-lg shadow-hacker-emerald/25"
                      : "text-hacker-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  Join Room
                </button>
              </div>

              <div className="space-y-4">
                {/* Username Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono text-hacker-muted uppercase tracking-wider ml-1">Your Name</label>
                  <div className="relative group">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hacker-muted group-focus-within:text-hacker-emerald transition-colors z-10" />
                    <input
                      type="text"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                      className="w-full bg-hacker-bg/60 border border-hacker-border rounded-xl px-11 py-3.5 text-sm focus:border-hacker-emerald focus:outline-none focus:ring-2 focus:ring-hacker-emerald/20 transition-all text-white font-medium placeholder:text-gray-700 hover:border-hacker-border/80"
                      placeholder="Enter your name"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Room ID Input */}
                {isJoin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="block text-[10px] font-mono text-hacker-muted uppercase tracking-wider ml-1">Room ID</label>
                    <div className="relative group">
                      <Code2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hacker-muted group-focus-within:text-hacker-emerald transition-colors z-10" />
                      <input
                        type="text"
                        value={roomId}
                        onChange={e => setRoomId(e.target.value)}
                        className="w-full bg-hacker-bg/60 border border-hacker-border rounded-xl px-11 py-3.5 text-sm focus:border-hacker-emerald focus:outline-none focus:ring-2 focus:ring-hacker-emerald/20 transition-all text-white font-mono placeholder:text-gray-700 hover:border-hacker-border/80"
                        placeholder="Paste room ID"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Premium CTA Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-hacker-emerald to-emerald-600 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-hacker-emerald/30 transition-all duration-300 flex items-center justify-center gap-2.5 group mt-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 text-sm tracking-wide">{isJoin ? 'Join Room' : 'Create Room'}</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <p className="text-center text-[11px] text-hacker-muted font-mono">
                No installation • No sign-up • No credit card
              </p>
            </form>
          </div>
        </motion.div>

      </main>

      {/* Professional Footer */}
      <footer className="border-t border-hacker-border bg-hacker-panel/30 backdrop-blur-sm py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-hacker-muted">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <span className="font-mono">Built by developers, for developers</span>
            <span className="hidden sm:block">•</span>
            <span className="font-mono">Next.js • React • Socket.IO • WebRTC</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-hacker-emerald transition-colors font-mono"
            >
              GitHub ↗
            </a>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-hacker-emerald animate-pulse" />
              <span className="font-mono uppercase tracking-wider">System Operational</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  )
}
