import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(cors())

const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

interface User {
    id: string
    name: string
    color: string
    socketId: string
}

interface File {
    id: string
    name: string
    language: string
    content: string
}

interface Room {
    id: string
    code: string // Keeping legacy support or derived from active file
    language: string
    users: User[]
    files: File[]
    password?: string
}

const rooms = new Map<string, Room>()

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', ({ roomId, user }) => {
        socket.join(roomId)

        let room = rooms.get(roomId)
        if (!room) {
            // Initialize with a default file if new room
            const defaultFile: File = {
                id: uuidv4(),
                name: 'index.js',
                language: 'javascript',
                content: '// Start coding here...'
            }
            room = {
                id: roomId,
                code: defaultFile.content,
                language: defaultFile.language,
                users: [],
                files: [defaultFile]
            }
            rooms.set(roomId, room)
        }

        const userWithSocket = { ...user, socketId: socket.id }
        room.users = room.users.filter(u => u.id !== user.id)
        room.users.push(userWithSocket)

        socket.emit('room-state', {
            code: room.code, // Deprecated in favor of files
            language: room.language,
            users: room.users,
            files: room.files
        })

        socket.to(roomId).emit('user-joined', userWithSocket)
    })

    socket.on('code-change', ({ roomId, code, fileId }) => {
        const room = rooms.get(roomId)
        if (room) {
            // Update specific file if fileId provided
            if (fileId) {
                const file = room.files.find(f => f.id === fileId)
                if (file) {
                    file.content = code
                    socket.to(roomId).emit('code-update', { code, fileId })
                }
            } else {
                // Legacy fallback or single-file mode
                room.code = code
                socket.to(roomId).emit('code-update', code)
            }
        }
    })

    socket.on('create-file', ({ roomId, name, language }) => {
        const room = rooms.get(roomId)
        if (room) {
            const newFile: File = {
                id: uuidv4(),
                name,
                language,
                content: ''
            }
            room.files.push(newFile)
            io.to(roomId).emit('file-created', newFile)
        }
    })

    socket.on('delete-file', ({ roomId, fileId }) => {
        const room = rooms.get(roomId)
        if (room) {
            room.files = room.files.filter(f => f.id !== fileId)
            io.to(roomId).emit('file-deleted', fileId)
        }
    })

    socket.on('language-change', ({ roomId, language, fileId }) => {
        const room = rooms.get(roomId)
        if (room) {
            if (fileId) {
                const file = room.files.find(f => f.id === fileId)
                if (file) {
                    file.language = language
                    // Broadcast with fileId
                    io.to(roomId).emit('language-update', { language, fileId })
                }
            } else {
                room.language = language
                io.to(roomId).emit('language-update', language)
            }
        }
    })

    socket.on('cursor-change', ({ roomId, cursor }) => {
        const room = rooms.get(roomId)
        if (room) {
            const user = room.users.find(u => u.socketId === socket.id)
            if (user) {
                socket.to(roomId).emit('cursor-update', {
                    userId: user.id,
                    cursor
                })
            }
        }
    })

    // Video Chat signaling events...
    socket.on('request-video-call', ({ roomId, userId, userName }) => {
        socket.to(roomId).emit('incoming-call', { fromId: userId, fromName: userName })
    })

    socket.on('accept-call', ({ roomId, userId }) => {
        socket.to(roomId).emit('user-video-ready', { userId })
    })

    socket.on('video-ready', ({ roomId, userId }) => {
        socket.to(roomId).emit('user-video-ready', { userId })
    })

    socket.on('video-signal', ({ roomId, to, signal }) => {
        const room = rooms.get(roomId)
        if (room) {
            const targetUser = room.users.find(u => u.id === to)
            if (targetUser) {
                io.to(targetUser.socketId).emit('video-signal', {
                    from: room.users.find(u => u.socketId === socket.id)?.id,
                    signal
                })
            }
        }
    })

    socket.on('video-stopped', ({ roomId, userId }) => {
        socket.to(roomId).emit('user-video-stopped', { userId })
    })

    socket.on('disconnect', () => {
        rooms.forEach((room, roomId) => {
            const index = room.users.findIndex(u => u.socketId === socket.id)
            if (index !== -1) {
                const user = room.users[index]
                room.users.splice(index, 1)
                io.to(roomId).emit('user-left', user.id)
            }
        })
    })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
