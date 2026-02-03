'use client'

import { useState } from 'react'
import { File, Plus, Trash2, FileCode, FolderOpen } from 'lucide-react' // Renamed imported File to FileIcon to avoid conflict
import { useEditorStore } from '@/lib/store'
import { Button } from '../ui/Button'
import { getSocket } from '@/lib/socket'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function FileExplorer() {
    const { files, activeFileId, setActiveFile, roomId } = useEditorStore()
    const [newFileName, setNewFileName] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    const handleCreateFile = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newFileName.trim()) return

        const socket = getSocket()
        // Default language based on extension
        const ext = newFileName.split('.').pop()
        let language = 'javascript'
        if (ext === 'py') language = 'python'
        if (ext === 'ts') language = 'typescript'
        if (ext === 'java') language = 'java'
        if (ext === 'cpp') language = 'cpp'
        if (ext === 'html') language = 'html'
        if (ext === 'css') language = 'css'

        socket?.emit('create-file', { roomId, name: newFileName, language })

        setNewFileName('')
        setIsCreating(false)
    }

    const handleDeleteFile = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this file?')) {
            getSocket()?.emit('delete-file', { roomId, fileId })
        }
    }

    const handleFileClick = (fileId: string) => {
        setActiveFile(fileId)
        // Emit selection change if you want to sync active file? 
        // Usually active file is user-local, but file LIST is synced.
    }

    return (
        <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-60">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center gap-2 text-gray-300 font-semibold text-xs uppercase tracking-wider">
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                    <span>Files</span>
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-gray-400 hover:text-white"
                    onClick={() => setIsCreating(true)}
                    title="New File"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {files.map(file => (
                    <div
                        key={file.id}
                        onClick={() => handleFileClick(file.id)}
                        className={cn(
                            "group flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm",
                            activeFileId === file.id
                                ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <FileCode className="w-4 h-4 flex-shrink-0 opacity-70" />
                            <span className="truncate">{file.name}</span>
                        </div>
                        {files.length > 1 && (
                            <button
                                onClick={(e) => handleDeleteFile(e, file.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-all"
                                title="Delete"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                ))}

                {isCreating && (
                    <form onSubmit={handleCreateFile} className="px-2 py-1">
                        <input
                            autoFocus
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="filename.js"
                            className="w-full bg-gray-800 text-white text-sm border border-blue-500 rounded px-2 py-1 focus:outline-none"
                            onBlur={() => !newFileName && setIsCreating(false)}
                        />
                    </form>
                )}
            </div>
        </div>
    )
}
