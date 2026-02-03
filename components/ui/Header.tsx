'use client'

import { Terminal, Copy, Video, Play } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/lib/store'

interface HeaderProps {
    roomId?: string
    onRun?: () => void
    onToggleVideo?: () => void
    onToggleSidebar?: () => void
}

export default function Header({ roomId, onRun, onToggleVideo, onToggleSidebar }: HeaderProps) {
    const { currentUser } = useEditorStore()

    const copyRoomId = () => {
        if (!roomId) return
        navigator.clipboard.writeText(roomId)
        toast.success('Room ID copied!')
    }

    return (
        <header className="h-14 border-b border-hacker-border bg-hacker-panel flex items-center justify-between px-4 shrink-0 transition-all duration-300">
            {/* Left Section */}
            <div className="flex items-center gap-4 md:gap-6">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="md:hidden text-hacker-emerald hover:text-white transition-colors p-1"
                    aria-label="Toggle sidebar"
                >
                    <Terminal className="w-5 h-5" />
                </button>

                {/* Desktop Sidebar Toggle - VS Code Style */}
                <button
                    onClick={onToggleSidebar}
                    className="hidden md:block text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded"
                    aria-label="Toggle sidebar"
                    title="Toggle Sidebar (Ctrl+B)"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="flex items-center gap-2 cursor-pointer group">
                    <Terminal className="w-5 h-5 text-hacker-emerald group-hover:text-hacker-emerald-glow transition-colors hidden md:block" />
                    <span className="font-bold text-white tracking-wide">CodeCollab</span>
                    <span className="text-[10px] bg-hacker-emerald/20 text-hacker-emerald px-1.5 py-0.5 rounded font-mono border border-hacker-emerald/20 hidden sm:block">SQUAD ED.</span>
                </div>

                {roomId && (
                    <div className="hidden md:flex items-center gap-3 pl-6 border-l border-hacker-border">
                        <span className="text-[10px] text-hacker-muted font-mono">ROOM:</span>
                        <span className="text-sm font-mono text-white select-all">{roomId}</span>
                        <button onClick={copyRoomId} className="text-hacker-muted hover:text-white transition-colors">
                            <Copy className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {/* Right Section: Squad Actions */}
            <div className="flex items-center gap-3">
                {/* Avatar (Static 'YOU' for now, or dynamic) */}
                <div className="flex -space-x-2 mr-4">
                    <div
                        className="w-8 h-8 rounded-full bg-hacker-border border border-black flex items-center justify-center text-[10px] font-bold text-white z-10"
                        style={{ backgroundColor: currentUser?.color }}
                    >
                        {currentUser?.name?.[0] || 'U'}
                    </div>
                </div>

                <button
                    onClick={onToggleVideo}
                    className="p-2 rounded bg-hacker-bg border border-hacker-border hover:border-hacker-emerald/50 hover:text-hacker-emerald transition-colors text-hacker-muted"
                >
                    <Video className="w-4 h-4" />
                </button>

                <button
                    onClick={onRun}
                    className="flex items-center gap-2 px-4 py-1.5 rounded bg-hacker-emerald/10 border border-hacker-emerald/30 text-hacker-emerald hover:bg-hacker-emerald hover:text-black transition-all duration-200 text-xs font-bold shadow-[0_0_10px_rgba(0,255,136,0.1)] active:scale-95"
                >
                    <Play className="w-3 h-3 fill-current" /> RUN
                </button>
            </div>
        </header>
    )
}
