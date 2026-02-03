import { create } from 'zustand'

export interface User {
    id: string
    name: string
    color: string
    socketId?: string
    cursor?: { line: number, column: number }
}

export interface File {
    id: string
    name: string
    language: string
    content: string
}

interface EditorState {
    // Editor UI State
    code: string
    language: string
    theme: string
    output: string
    isExecuting: boolean

    // Room State
    roomId: string | null
    users: User[]
    currentUser: User | null
    files: File[]
    activeFileId: string | null

    // Actions
    setCode: (code: string) => void
    setLanguage: (language: string) => void
    setTheme: (theme: string) => void
    setUsers: (users: User[]) => void
    addUser: (user: User) => void
    removeUser: (userId: string) => void
    setCurrentUser: (user: User) => void
    setRoomId: (roomId: string) => void
    updateUserCursor: (userId: string, cursor: { line: number, column: number }) => void
    setOutput: (output: string) => void
    setIsExecuting: (isExecuting: boolean) => void

    // File Actions
    setFiles: (files: File[]) => void
    addFile: (file: File) => void
    removeFile: (fileId: string) => void
    updateFile: (fileId: string, updates: Partial<File>) => void
    setActiveFileId: (fileId: string) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
    code: '',
    language: 'javascript',
    theme: 'hacker-dark',
    output: '',
    isExecuting: false,

    roomId: null,
    users: [],
    currentUser: null,

    files: [],
    activeFileId: null,

    setCode: (code) => {
        set({ code })
        // Also update the active file content
        const { activeFileId, files } = get()
        if (activeFileId) {
            set({
                files: files.map(f => f.id === activeFileId ? { ...f, content: code } : f)
            })
        }
    },
    setLanguage: (language) => {
        set({ language })
        // Update active file language
        const { activeFileId, files } = get()
        if (activeFileId) {
            set({
                files: files.map(f => f.id === activeFileId ? { ...f, language } : f)
            })
        }
    },
    setTheme: (theme) => set({ theme }),
    setUsers: (users) => set({ users }),
    addUser: (user) => set((state) => {
        if (state.users.find(u => u.id === user.id)) return state
        return { users: [...state.users, user] }
    }),
    removeUser: (userId) => set((state) => ({ users: state.users.filter(u => u.id !== userId) })),
    setCurrentUser: (user) => set({ currentUser: user }),
    setRoomId: (roomId) => set({ roomId }),
    updateUserCursor: (userId, cursor) => set((state) => ({
        users: state.users.map(u => u.id === userId ? { ...u, cursor } : u)
    })),
    setOutput: (output) => set({ output }),
    setIsExecuting: (isExecuting) => set({ isExecuting }),

    // File Actions Implementation
    setFiles: (files) => {
        set({ files })
        // If no active file and files exist, set first as active
        const { activeFileId } = get()
        if (!activeFileId && files.length > 0) {
            get().setActiveFileId(files[0].id)
        }
    },
    addFile: (file) => set((state) => ({ files: [...state.files, file] })),
    removeFile: (fileId) => set((state) => {
        const newFiles = state.files.filter(f => f.id !== fileId)
        // If active file removed, switch to another
        if (state.activeFileId === fileId) {
            const nextFile = newFiles[0]
            if (nextFile) {
                return {
                    files: newFiles,
                    activeFileId: nextFile.id,
                    code: nextFile.content,
                    language: nextFile.language
                }
            } else {
                return {
                    files: newFiles,
                    activeFileId: null,
                    code: '',
                    language: 'javascript'
                }
            }
        }
        return { files: newFiles }
    }),
    updateFile: (fileId, updates) => set((state) => {
        const newFiles = state.files.map(f => f.id === fileId ? { ...f, ...updates } : f)
        // If updating active file, also update editor state
        if (state.activeFileId === fileId) {
            const updatedFile = newFiles.find(f => f.id === fileId)
            if (updatedFile) {
                return {
                    files: newFiles,
                    code: updatedFile.content,
                    language: updatedFile.language
                }
            }
        }
        return { files: newFiles }
    }),
    setActiveFileId: (fileId: string) => {
        const { files } = get()
        const file = files.find(f => f.id === fileId)
        if (file) {
            set({
                activeFileId: fileId,
                code: file.content,
                language: file.language,
                output: '' // Clear output on file switch? maybe 
            })
        }
    }
}))
