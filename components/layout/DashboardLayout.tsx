'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Tv,
    Terminal,
    Users,
    FileCode,
    Menu,
    X,
    Settings,
    Shield,
    LayoutDashboard
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
    children: React.ReactNode
    sidebarContent: React.ReactNode
    activeTab: 'editor' | 'files' | 'settings' | 'participants'
    onTabChange: (tab: any) => void
}

export default function DashboardLayout({
    children,
    sidebarContent,
    activeTab,
    onTabChange
}: DashboardLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(true)

    const tabs = [
        { id: 'files', icon: FileCode, label: 'Files' },
        { id: 'participants', icon: Users, label: 'Squad' },
        { id: 'editor', icon: Tv, label: 'Editor' }, // Usually implicit, but maybe show stats?
    ]

    return (
        <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden selection:bg-emerald-500/30">
            {/* Main Navigation Sidebar (Leftmost strip) */}
            <div className="w-16 flex flex-col items-center py-4 bg-[#050505] border-r border-gray-800 z-30">
                <div className="mb-6">
                    <LayoutDashboard className="w-8 h-8 text-emerald-500" />
                </div>

                <div className="flex flex-col gap-4 w-full px-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                onTabChange(tab.id)
                                setSidebarOpen(true)
                            }}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-200 group relative",
                                activeTab === tab.id
                                    ? "bg-emerald-600/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                            )}
                            title={tab.label}
                        >
                            <tab.icon className="w-5 h-5" />
                            {activeTab === tab.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-400 rounded-r-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-auto">
                    <button className="p-3 text-gray-400 hover:text-gray-200">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Dynamic Sidebar Panel (Files/Participants etc) */}
            <AnimatePresence mode='wait'>
                {isSidebarOpen && (activeTab === 'files' || activeTab === 'participants') && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="border-r border-gray-800 bg-[#0a0a0a] flex flex-col z-20"
                    >
                        <div className="p-4 border-b border-gray-800/50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-200 uppercase tracking-wider text-sm">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {sidebarContent}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-black relative">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
                {children}
            </div>
        </div>
    )
}
