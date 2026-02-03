'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Header from '@/components/ui/Header'
import CodeEditor from '@/components/editor/CodeEditor'
import LanguageSelector from '@/components/editor/LanguageSelector'
import OutputPanel from '@/components/editor/OutputPanel'
import { Button } from '@/components/ui/Button'
import { useEditorStore } from '@/lib/store'
import { getUserColor } from '@/lib/utils'
import { Play, Terminal as TerminalIcon, X, Plus, MessageSquare, Send, Terminal, Users, Video } from 'lucide-react'
import { initSocket, getSocket } from '@/lib/socket'
import VideoChat from '@/components/chat/VideoChat'
import { Toaster, toast } from 'sonner'
import ParticipantsList from '@/components/ui/ParticipantsList'
import FileExplorer from '@/components/editor/FileExplorer'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { cn } from '@/lib/utils'

export default function RoomPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const roomId = params.roomId as string
    const userName = searchParams.get('name') || 'Anonymous'
    const password = searchParams.get('password')

    const { setRoomId, setCurrentUser, language, setLanguage, setCode, code, users, files, activeFileId, setFiles, updateFile, addFile, removeFile, addUser, removeUser, updateUserCursor, setActiveFileId } = useEditorStore()
    const [activeTab, setActiveTab] = useState<'files' | 'chat' | 'settings' | 'participants'>('files')
    const [isVideoOpen, setIsVideoOpen] = useState(false)
    const [isTerminalOpen, setIsTerminalOpen] = useState(true)
    const [terminalHeight, setTerminalHeight] = useState(280) // Default terminal height
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const toggleTerminal = () => setIsTerminalOpen(!isTerminalOpen)
    const [chatMessage, setChatMessage] = useState('')
    const [chatHistory, setChatHistory] = useState<{ sender: string, text: string, time: string }[]>([])

    // Socket Initialization
    useEffect(() => {
        setRoomId(roomId)
        const userId = Math.random().toString(36).substring(7)
        setCurrentUser({ id: userId, name: userName, color: getUserColor(userId) })

        const socket = initSocket()
        if (socket) {
            socket.emit('join-room', { roomId, user: { id: userId, name: userName, color: getUserColor(userId) }, password })

            socket.on('error', (message: string) => toast.error(message))
            socket.on('room-state', ({ code, language, users, files }: any) => {
                if (files && files.length > 0) setFiles(files)
                else if (code) setCode(code)
                if (users) useEditorStore.getState().setUsers(users)
            })

            socket.on('code-update', (data: any) => {
                if (typeof data === 'string') setCode(data)
                else updateFile(data.fileId, { content: data.code })
            })

            socket.on('language-update', (data: any) => {
                if (typeof data === 'string') setLanguage(data)
                else updateFile(data.fileId, { language: data.language })
            })

            socket.on('file-created', (file: any) => addFile(file))
            socket.on('file-deleted', (fileId: string) => removeFile(fileId))
            socket.on('user-joined', (user: any) => addUser(user))
            socket.on('user-left', (userId: string) => removeUser(userId))
            socket.on('cursor-update', ({ userId, cursor }: any) => updateUserCursor(userId, cursor))
        }

        return () => {
            if (socket) {
                socket.off('room-state'); socket.off('code-update'); socket.off('language-update')
                socket.off('file-created'); socket.off('file-deleted'); socket.off('user-joined')
                socket.off('user-left'); socket.off('cursor-update'); socket.off('error')
            }
        }
    }, [roomId, userName])

    const handleRunCode = async () => {
        useEditorStore.getState().setIsExecuting(true)
        useEditorStore.getState().setOutput('')
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            })
            const result = await response.json()
            useEditorStore.getState().setOutput(result.error ? `Error: ${result.error}` : `${result.output}\n\nExecution time: ${result.executionTime}ms`)
        } catch (error: any) {
            useEditorStore.getState().setOutput(`Error: ${error.message}`)
        } finally {
            useEditorStore.getState().setIsExecuting(false)
        }
    }

    const onCodeChange = (newCode: string) => {
        setCode(newCode)
        if (activeFileId) getSocket()?.emit('code-change', { roomId, code: newCode, fileId: activeFileId })
    }

    const onCursorChange = (cursor: { line: number, column: number }) => {
        getSocket()?.emit('cursor-change', { roomId, cursor })
    }

    const handleSendChat = () => {
        if (!chatMessage.trim()) return
        const msg = { sender: 'You', text: chatMessage, time: new Date().toLocaleTimeString() }
        setChatHistory([...chatHistory, msg])
        setChatMessage('')
        // Emit socket event here in real app
    }

    // Sidebar Content Switcher
    const renderSidebar = () => {
        switch (activeTab) {
            case 'files': return (
                <div className="flex flex-col h-full bg-[#0a0a0a]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-hacker-border/50">
                        <span className="text-xs text-gray-400 font-mono uppercase tracking-wide font-semibold">Explorer</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-hacker-emerald hover:bg-hacker-emerald/10 transition-colors"
                            onClick={() => document.getElementById('new-file-trigger')?.click()}
                            aria-label="Add new file"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                        <FileExplorer />
                    </div>
                </div>
            )
            case 'chat': return (
                <div className="flex flex-col h-full bg-[#0a0a0a]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <div className="text-center text-[11px] text-gray-500 font-medium my-2">Today</div>
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={cn("flex flex-col gap-1", msg.sender === 'You' ? "items-end" : "items-start")}>
                                <div className={cn("max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed shadow-sm",
                                    msg.sender === 'You'
                                        ? "bg-gradient-to-br from-hacker-emerald to-emerald-600 text-black font-medium rounded-br-sm"
                                        : "bg-[#1a1a1a] text-gray-200 rounded-bl-sm border border-white/10"
                                )}
                                >
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-600 px-1">{msg.time}</span>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 py-3 border-t border-hacker-border/50 bg-hacker-panel/50">
                        <div className="flex gap-2">
                            <input
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                placeholder="Message squad..."
                                aria-label="Chat message input"
                                className="flex-1 bg-hacker-bg border border-hacker-border/80 rounded-lg px-3 py-2.5 text-sm text-white focus:border-hacker-emerald focus:ring-2 focus:ring-hacker-emerald/20 focus:outline-none font-sans placeholder:text-gray-500 transition-all"
                            />
                            <button
                                onClick={handleSendChat}
                                className="bg-hacker-emerald text-black px-3 py-2.5 rounded-lg hover:bg-emerald-400 transition-all flex items-center justify-center min-w-[44px] shadow-sm"
                                aria-label="Send message"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )
            case 'settings':
                const themeOptions = [
                    { name: 'Hacker Dark', value: 'hacker-dark' },
                    { name: 'Dracula', value: 'dracula' },
                    { name: 'One Dark', value: 'one-dark' },
                    { name: 'Monokai', value: 'monokai' },
                ]
                return (
                    <div className="p-4 space-y-6 bg-[#0a0a0a] h-full">
                        <div>
                            <span className="text-[10px] text-hacker-muted font-mono uppercase tracking-wider block mb-3">Editor Theme</span>
                            <div className="space-y-2">
                                {themeOptions.map(themeOption => (
                                    <label
                                        key={themeOption.value}
                                        className="flex items-center gap-3 p-2 rounded border border-hacker-border cursor-pointer hover:bg-hacker-border/50 transition-colors"
                                        onClick={() => useEditorStore.getState().setTheme(themeOption.value)}
                                    >
                                        <input
                                            type="radio"
                                            name="theme"
                                            checked={useEditorStore.getState().theme === themeOption.value}
                                            onChange={() => { }}
                                            className="accent-hacker-emerald"
                                        />
                                        <span className="text-sm text-gray-200">{themeOption.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-hacker-muted font-mono uppercase tracking-wider block mb-3">Account</span>
                            <div className="text-xs text-gray-400 p-2 bg-hacker-border/30 rounded">
                                Signed in as <span className="text-white font-bold">{userName}</span>
                            </div>
                        </div>
                    </div>
                )
            default: return null
        }
    }

    return (
        <div className="flex flex-col h-screen bg-hacker-bg overflow-hidden font-sans">
            <Header
                roomId={roomId}
                onRun={handleRunCode}
                onToggleVideo={() => setIsVideoOpen(!isVideoOpen)}
                onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            />

            <DashboardLayout
                activeTab={activeTab}
                onTabChange={setActiveTab}
                sidebarContent={renderSidebar()}
                isSidebarOpen={isSidebarOpen}
                onSidebarClose={() => setSidebarOpen(false)}
            >
                <div className="flex flex-col h-full relative bg-[#0a0a0a]">
                    {/* VS Code-Style Editor Tabs */}
                    <div className="h-10 bg-[#1e1e1e] border-b border-hacker-border flex items-center overflow-x-auto no-scrollbar shrink-0">
                        {files.map(file => (
                            <div
                                key={file.id}
                                onClick={() => setActiveFileId(file.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-xs border-r border-hacker-border cursor-pointer min-w-[120px] max-w-[200px] transition-colors group relative",
                                    activeFileId === file.id
                                        ? "bg-[#0a0a0a] text-white"
                                        : "bg-transparent text-hacker-muted hover:bg-white/5"
                                )}
                            >
                                <span className="truncate font-mono font-medium">{file.name}</span>
                                {activeFileId === file.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hacker-emerald" />
                                )}
                                <button
                                    className="ml-auto opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded p-0.5 transition-opacity"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        // Close file logic
                                    }}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Main Editor Area */}
                    <div className="flex-1 flex flex-col min-h-0 relative">
                        {/* Breadcrumb */}
                        <div className="h-8 bg-hacker-bg/50 border-b border-hacker-border/50 flex items-center px-4 text-xs text-hacker-muted font-mono shrink-0">
                            <span className="text-hacker-emerald">{roomId}</span>
                            <span className="mx-2">/</span>
                            <span>{files.find(f => f.id === activeFileId)?.name || 'untitled'}</span>
                        </div>

                        {/* Code Editor */}
                        <div className="flex-1 relative z-0 overflow-hidden">
                            <CodeEditor onCodeChange={onCodeChange} onCursorChange={onCursorChange} />
                        </div>

                        {/* VS Code-Style Status Bar */}
                        <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-xs font-mono shrink-0 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Terminal className="w-3 h-3" />
                                    <span className="font-semibold">{roomId.slice(0, 8)}</span>
                                </div>
                                <div className="flex items-center gap-1 hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer" title="Click to change language">
                                    <LanguageSelector selected={language} onSelect={(lang) => {
                                        setLanguage(lang)
                                        if (activeFileId) {
                                            getSocket()?.emit('language-change', { roomId, language: lang, fileId: activeFileId })
                                        }
                                    }} />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-white/90">
                                <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
                                    UTF-8
                                </div>
                                <div className="hover:bg-white/10 px-2 py-0.5 rounded cursor-pointer">
                                    LF
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>{users.length}</span>
                                </div>
                            </div>
                        </div>


                        {/* VS Code-Style Terminal Panel with Collapse */}
                        <div
                            className={cn(
                                "border-t border-hacker-border/50 bg-[#1e1e1e] shrink-0 transition-all duration-300 ease-in-out overflow-hidden",
                                isTerminalOpen ? "" : "h-0"
                            )}
                            style={{ height: isTerminalOpen ? `${terminalHeight}px` : '0px' }}
                        >
                            {/* Terminal Header with Tabs and Controls */}
                            <div className="h-9 bg-[#252526] border-b border-hacker-border/30 flex items-center justify-between px-3 select-none">
                                <div className="flex items-center gap-1">
                                    <button className="px-3 py-1 text-xs font-medium text-white bg-hacker-bg/50 border-b-2 border-hacker-emerald">
                                        TERMINAL
                                    </button>
                                    <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-300">
                                        OUTPUT
                                    </button>
                                    <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-300">
                                        PROBLEMS
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleTerminal}
                                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/5 rounded"
                                        title="Hide Panel (Ctrl+`)"
                                        aria-label="Toggle terminal panel"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Terminal Content */}
                            <div className="h-[calc(100%-36px)] overflow-hidden">
                                <OutputPanel />
                            </div>
                        </div>

                        {/* Terminal Toggle Button (when collapsed) */}
                        {!isTerminalOpen && (
                            <button
                                onClick={toggleTerminal}
                                className="absolute bottom-0 right-4 bg-[#007acc] text-white px-3 py-1 rounded-t text-xs font-medium hover:bg-[#005a9e] transition-colors shadow-lg flex items-center gap-2"
                                title="Show Terminal (Ctrl+`)"
                                aria-label="Show terminal panel"
                            >
                                <TerminalIcon className="w-3 h-3" />
                                <span>Terminal</span>
                            </button>
                        )}
                    </div>

                    {/* Video Overlay */}
                    <div className={cn(
                        "absolute bottom-56 right-4 w-64 bg-[#1e1e1e] border border-hacker-border rounded-lg shadow-2xl z-40 transition-all duration-300 flex flex-col overflow-hidden",
                        isVideoOpen ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0 pointer-events-none"
                    )}>
                        <div className="h-8 bg-[#252526] border-b border-hacker-border flex items-center justify-between px-3 shrink-0">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                                <Video className="w-3.5 h-3.5 text-hacker-emerald" />
                                Squad Voice
                            </span>
                            <button onClick={() => setIsVideoOpen(false)} className="text-hacker-muted hover:text-white">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="bg-[#1e1e1e] h-64 overflow-y-auto custom-scrollbar p-0">
                            <VideoChat roomId={roomId} userId={useEditorStore.getState().currentUser?.id || ''} />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
            <Toaster position="top-right" theme="dark" invert richColors />
        </div>
    )
}


