'use client'

import { Code2, Copy, Check, Share2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from './Button'
import { useState } from 'react'
import { toast } from 'sonner'

interface HeaderProps {
    roomId?: string
}

export default function Header({ roomId }: HeaderProps) {
    const [copied, setCopied] = useState(false)

    const copyRoomId = () => {
        if (!roomId) return
        navigator.clipboard.writeText(roomId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.success('Room ID copied!')
    }

    const shareRoom = () => {
        if (!roomId) return
        const url = `${window.location.origin}/room/${roomId}`
        navigator.clipboard.writeText(url)
        toast.success('Room Link copied to clipboard!')
    }

    return (
        <header className="h-16 border-b border-gray-800 bg-[#0b1120] px-6 flex items-center justify-between shadow-lg relative z-20">
            <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                    <Code2 className="w-8 h-8 text-blue-400 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-white leading-none">CodeCollab</span>
                    <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Squad Edition</span>
                </div>
            </Link>

            {roomId && (
                <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-1 bg-gray-900/80 border border-gray-700/50 rounded-lg pl-3 pr-1 py-1.5 shadow-inner backdrop-blur-sm">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mr-2">Mission ID</span>
                        <code className="text-sm font-mono font-bold text-gray-100 mr-3 tracking-wide">{roomId}</code>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-white/10 text-gray-300 hover:text-white rounded-md transition-all"
                            onClick={copyRoomId}
                            title="Copy ID"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                        </Button>

                        <div className="w-px h-4 bg-gray-700 mx-1" />

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-md transition-all"
                            onClick={shareRoom}
                            title="Share Link"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </header>
    )
}
