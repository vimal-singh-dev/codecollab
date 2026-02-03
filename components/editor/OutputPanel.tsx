'use client'

import { Terminal, Loader2, Play, Eraser } from 'lucide-react'
import { useEditorStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'

export default function OutputPanel() {
    const { output, isExecuting, setOutput } = useEditorStore()

    return (
        <div className="h-full flex flex-col font-mono text-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900">
                <div className="flex items-center gap-2 text-gray-300">
                    <Terminal className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold tracking-wide text-xs uppercase">Terminal Output</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOutput('')}
                    className="h-6 w-6 text-gray-500 hover:text-red-400"
                    title="Clear Output"
                >
                    <Eraser className="w-3 h-3" />
                </Button>
            </div>

            {/* Output Content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-950 custom-scrollbar">
                {isExecuting ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-blue-400">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm">Running code...</span>
                    </div>
                ) : output ? (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <span className="text-green-500 font-bold">➜</span>
                            <pre className="whitespace-pre-wrap text-gray-300 font-fira-code leading-relaxed break-all">
                                {output}
                            </pre>
                        </div>
                        {/* We could parse Execution time but it's part of string now */}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
                        <div className="p-4 rounded-full bg-gray-900">
                            <Play className="w-8 h-8 ml-1" />
                        </div>
                        <p className="text-center max-w-[200px]">Run your code to see the output here</p>
                    </div>
                )}
            </div>
        </div>
    )
}
