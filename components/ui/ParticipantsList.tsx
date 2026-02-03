'use client'

import { useEditorStore } from '@/lib/store'
import { Users } from 'lucide-react'

export default function ParticipantsList() {
    const { users, currentUser } = useEditorStore()

    return (
        <div className="flex -space-x-2 overflow-hidden items-center">
            {users.slice(0, 5).map((user) => (
                <div
                    key={user.id}
                    className="relative inline-block w-8 h-8 rounded-full ring-2 ring-gray-900 bg-gray-800 text-white flex items-center justify-center text-xs font-bold border border-gray-700"
                    style={{ backgroundColor: user.color }}
                    title={user.name + (user.id === currentUser?.id ? ' (You)' : '')}
                >
                    {user.name.charAt(0).toUpperCase()}

                    {/* Online indicator */}
                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-gray-900 bg-green-400" />
                </div>
            ))}
            {users.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-gray-900 bg-gray-800 text-xs font-medium text-white">
                    +{users.length - 5}
                </div>
            )}
        </div>
    )
}
