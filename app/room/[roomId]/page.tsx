'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Header from '@/components/ui/Header'
import CodeEditor from '@/components/editor/CodeEditor'
import LanguageSelector from '@/components/editor/LanguageSelector'
import OutputPanel from '@/components/editor/OutputPanel'
import { Button } from '@/components/ui/Button'
import { useEditorStore } from '@/lib/store'
import { getUserColor } from '@/lib/utils'
import { Play, Download, Maximize2, Minimize2, PanelRightClose, PanelRightOpen, Users } from 'lucide-react'
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
    const password = searchParams.get('password') // Get password from URL

    const { setRoomId, setCurrentUser, language, setLanguage, setCode, code, users } = useEditorStore()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState<'editor' | 'files' | 'settings' | 'participants'>('files')

    useEffect(() => {
        setRoomId(roomId)
        const userId = Math.random().toString(36).substring(7)
        setCurrentUser({
            id: userId,
            name: userName,
            color: getUserColor(userId)
        })

        const socket = initSocket()

        if (socket) {
            socket.emit('join-room', {
                roomId,
                user: {
                    id: userId,
                    name: userName,
                    color: getUserColor(userId)
                },
                password // Send password
            })

            // Handle connection errors (invalid password)
            socket.on('error', (message: string) => {
                toast.error(message)
                // Optionally redirect back to home after delay
                // setTimeout(() => router.push('/'), 2000)
            })

            socket.on('room-state', ({ code, language, users, files }: any) => {
                // If files provided, use them.
                if (files && files.length > 0) {
                    useEditorStore.getState().setFiles(files)
                    // If we have an active file preference or default, store handles it.
                } else if (code) {
                    // Fallback for old rooms or whatever
                    setCode(code)
                }

                if (users) {
                    useEditorStore.getState().setUsers(users)
                }
            })

            socket.on('code-update', (data: any) => {
                // Support both old string format and new object format
                if (typeof data === 'string') {
                    setCode(data)
                } else {
                    const { code, fileId } = data
                    // update file content in store
                    useEditorStore.getState().updateFile(fileId, { content: code })
                }
            })

            socket.on('language-update', (data: any) => {
                if (typeof data === 'string') {
                    setLanguage(data)
                } else {
                    const { language, fileId } = data
                    useEditorStore.getState().updateFile(fileId, { language })
                }
            })

            socket.on('file-created', (file: any) => useEditorStore.getState().addFile(file))
            socket.on('file-deleted', (fileId: string) => useEditorStore.getState().removeFile(fileId))

            socket.on('user-joined', (user: any) => useEditorStore.getState().addUser(user))
            socket.on('user-left', (userId: string) => useEditorStore.getState().removeUser(userId))
            socket.on('cursor-update', ({ userId, cursor }: any) => useEditorStore.getState().updateUserCursor(userId, cursor))
        }

        return () => {
            if (socket) {
                socket.off('room-state')
                socket.off('code-update')
                socket.off('language-update')
                socket.off('file-created')
                socket.off('file-deleted')
                socket.off('user-joined')
                socket.off('user-left')
                socket.off('cursor-update')
                socket.off('error')
            }
        }
    }, [roomId, userName, setRoomId, setCurrentUser, setCode, setLanguage])

    const handleRunCode = async () => {
        useEditorStore.getState().setIsExecuting(true)
        useEditorStore.getState().setOutput('')

        // Use active file content derived from store via `code` (which is synced to active file)

        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            })

            const result = await response.json()

            if (result.error) {
                useEditorStore.getState().setOutput(`Error: ${result.error}`)
            } else {
                useEditorStore.getState().setOutput(
                    `${result.output}\n\nExecution time: ${result.executionTime}ms`
                )
            }
        } catch (error: any) {
            useEditorStore.getState().setOutput(`Error: ${error.message}`)
        } finally {
            useEditorStore.getState().setIsExecuting(false)
        }
    }

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `code.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'txt'}`
        a.click()
    }

    const onCodeChange = (newCode: string) => {
        // We set code locally, store updates active file content.
        setCode(newCode)
        const activeFileId = useEditorStore.getState().activeFileId
        if (activeFileId) {
            getSocket()?.emit('code-change', { roomId, code: newCode, fileId: activeFileId })
        }
    }

    const onCursorChange = (cursor: { line: number, column: number }) => {
        getSocket()?.emit('cursor-change', { roomId, cursor })
    }

    return (
        <DashboardLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sidebarContent={
                activeTab === 'files' ? <FileExplorer /> :
                    activeTab === 'participants' ? (
                        <div className="p-4 space-y-4">
                            <ParticipantsList />
                            <div className="pt-4 border-t border-gray-800">
                                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Invite</h3>
                                <Button onClick={() => getSocket()?.emit('request-video-call', { roomId, userId: users.find(u => u.name === userName)?.id, userName })}
                                    variant="outline"
                                    className="w-full bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border-blue-600/30 font-medium"
                                >
                                    Start Squad Call
                                </Button>
                            </div>
                        </div>
                    ) : null
            }
        >
            <div className="h-full flex flex-col">
                <Header roomId={roomId} />

                {/* Editor Toolbar */}
                <div className="h-14 border-b border-gray-800 bg-[#0a0e17] px-4 flex items-center justify-between z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <LanguageSelector
                            selected={language}
                            onSelect={(lang) => {
                                setLanguage(lang)
                                const activeFileId = useEditorStore.getState().activeFileId
                                if (activeFileId) {
                                    getSocket()?.emit('language-change', { roomId, language: lang, fileId: activeFileId })
                                }
                            }}
                        />
                        {/* Compact Participants Preview */}
                        <div className="flex -space-x-2">
                            {users.slice(0, 3).map(u => (
                                <div key={u.id} className="w-6 h-6 rounded-full ring-2 ring-[#0a0e17] flex items-center justify-center text-[10px] font-bold text-white bg-gray-700" style={{ backgroundColor: u.color }}>
                                    {u.name[0]}
                                </div>
                            ))}
                            {users.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-800 ring-2 ring-[#0a0e17] flex items-center justify-center text-[10px] text-gray-400">
                                    +{users.length - 3}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={handleRunCode} className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-green-400/20 font-semibold tracking-wide" size="sm">
                            <Play className="w-4 h-4 fill-current" />
                            Run Protocol
                        </Button>
                        <Button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            variant="ghost"
                            size="icon"
                            className={cn("text-gray-400 hover:text-white transition-transform duration-300", sidebarOpen ? "rotate-180" : "")}
                        >
                            <PanelRightOpen className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Grid: Editor + Terminal/Video */}
                <div className="flex-1 flex overflow-hidden relative">
                    {/* Editor */}
                    <div className="flex-1 relative z-0 min-w-0">
                        <CodeEditor onCodeChange={onCodeChange} onCursorChange={onCursorChange} />
                    </div>

                    {/* Right Panel (Terminal/Video) */}
                    <div className={cn(
                        "w-96 border-l border-gray-800 bg-[#0b1120] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                        !sidebarOpen && "w-0 border-l-0 opacity-0 overflow-hidden"
                    )}>
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Video Chat Container */}
                            <div className="p-4 border-b border-gray-800 bg-[#080d1a]">
                                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3 px-1">Video Chat</h3>
                                <div className="max-h-[35vh] overflow-y-auto custom-scrollbar">
                                    <VideoChat roomId={roomId} userId={useEditorStore.getState().currentUser?.id || ''} />
                                </div>
                            </div>
                            {/* Terminal */}
                            <div className="flex-1 flex flex-col bg-[#0b1120] relative min-h-0">
                                <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                                <OutputPanel />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Toaster position="bottom-right" theme="dark" invert richColors />
        </DashboardLayout>
    )
}
