'use client'

import { useState } from 'react'
import { FileCode, MessageSquare, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
    children: React.ReactNode
    sidebarContent: React.ReactNode
    activeTab: 'files' | 'chat' | 'settings' | 'participants'
    onTabChange: (tab: any) => void
    isSidebarOpen: boolean
    onSidebarClose: () => void
}

export default function DashboardLayout({
    children,
    sidebarContent,
    activeTab,
    onTabChange,
    isSidebarOpen,
    onSidebarClose
}: DashboardLayoutProps) {

    const tabs = [
        { id: 'files', icon: FileCode, label: 'FILES' },
        { id: 'chat', icon: MessageSquare, label: 'CHAT' },
        { id: 'settings', icon: Settings, label: 'CONFIG' },
    ]

    return (
        <div className="flex flex-1 overflow-hidden relative h-full">
            {/* SIDEBAR */}
            <aside
                className={cn(
                    "bg-hacker-bg border-r border-hacker-border flex flex-col shrink-0 transition-all duration-300 ease-in-out z-20 h-full",
                    // Mobile: slide in/out
                    "absolute md:relative",
                    isSidebarOpen
                        ? "w-64 translate-x-0"
                        : "w-0 md:w-0 -translate-x-full md:translate-x-0 overflow-hidden border-r-0"
                )}
            >
                {/* Tabs */}
                <div className="flex border-b border-hacker-border/50 overflow-x-auto no-scrollbar shrink-0 bg-[#0f0f0f]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex-1 py-2.5 text-[11px] font-bold border-b-2 flex flex-col items-center justify-center gap-1.5 transition-all min-w-[80px]",
                                activeTab === tab.id
                                    ? "text-hacker-emerald border-hacker-emerald bg-white/5"
                                    : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5"
                            )}
                            aria-label={`Switch to ${tab.label} tab`}
                            aria-current={activeTab === tab.id ? "page" : undefined}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="tracking-wider">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {sidebarContent}
                </div>
            </aside>

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="absolute inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm"
                    onClick={onSidebarClose}
                />
            )}

            {/* Toggle Handlers (Usually in Header, but exposed via context/props if needed) */}

            {/* MAIN CONTENT */}
            <main className="flex-1 relative bg-[#0a0a0a] flex flex-col min-w-0 font-sans">
                {children}
            </main>
        </div>
    )
}
