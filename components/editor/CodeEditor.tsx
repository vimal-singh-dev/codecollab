'use client'

import Editor, { Monaco } from '@monaco-editor/react'
import { useRef, useEffect } from 'react'
import { useEditorStore } from '@/lib/store'
// import * as monaco from 'monaco-editor' // REMOVED to prevent SSR error "window is not defined"

// We can import types only if needed, but 'Monaco' from @monaco-editor/react covers most instances.
// However, exact types like IStandaloneCodeEditor are from 'monaco-editor'.
// Importing types is safe as they are erased at runtime.
import type * as MonacoTypes from 'monaco-editor'

interface CodeEditorProps {
    onCodeChange?: (code: string) => void
    onCursorChange?: (position: { line: number; column: number }) => void
}

export default function CodeEditor({ onCodeChange, onCursorChange }: CodeEditorProps) {
    const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(null)
    const monacoRef = useRef<Monaco | null>(null)
    const { code, language, users, setCode, currentUser, theme } = useEditorStore()

    const handleEditorDidMount = (editor: MonacoTypes.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor
        monacoRef.current = monaco

        // Define Hacker Dark Theme
        monaco.editor.defineTheme('hacker-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                { token: 'keyword', foreground: '00ff88' },
                { token: 'string', foreground: 'a5f3fc' },
            ],
            colors: {
                'editor.background': '#0a0a0a',
                'editor.foreground': '#e0e0e0',
                'editor.lineHighlightBackground': '#111111',
                'editorCursor.foreground': '#00ff88',
                'editor.selectionBackground': '#003300',
                'editorLineNumber.foreground': '#333333',
                'editorLineNumber.activeForeground': '#666666'
            }
        });

        // Define Dracula Theme
        monaco.editor.defineTheme('dracula', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'ff79c6' },
                { token: 'string', foreground: 'f1fa8c' },
                { token: 'number', foreground: 'bd93f9' },
            ],
            colors: {
                'editor.background': '#282a36',
                'editor.foreground': '#f8f8f2',
                'editor.lineHighlightBackground': '#44475a',
                'editorCursor.foreground': '#f8f8f0',
                'editor.selectionBackground': '#44475a75',
            }
        });

        // Define One Dark Theme
        monaco.editor.defineTheme('one-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'c678dd' },
                { token: 'string', foreground: '98c379' },
                { token: 'number', foreground: 'd19a66' },
            ],
            colors: {
                'editor.background': '#282c34',
                'editor.foreground': '#abb2bf',
                'editor.lineHighlightBackground': '#2c313c',
                'editorCursor.foreground': '#528bff',
                'editor.selectionBackground': '#3e4451',
            }
        });

        // Define Monokai Theme
        monaco.editor.defineTheme('monokai', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'f92672' },
                { token: 'string', foreground: 'e6db74' },
                { token: 'number', foreground: 'ae81ff' },
            ],
            colors: {
                'editor.background': '#272822',
                'editor.foreground': '#f8f8f2',
                'editor.lineHighlightBackground': '#3e3d32',
                'editorCursor.foreground': '#f8f8f0',
                'editor.selectionBackground': '#49483e',
            }
        });

        // Set initial theme from store
        const currentTheme = useEditorStore.getState().theme
        monaco.editor.setTheme(currentTheme);

        editor.onDidChangeCursorPosition((e) => {
            onCursorChange?.({
                line: e.position.lineNumber,
                column: e.position.column
            })
        })

        editor.onDidChangeModelContent(() => {
            const value = editor.getValue()
            if (value !== useEditorStore.getState().code) {
                onCodeChange?.(value)
            }
        })
    }

    // Render other users' cursors
    useEffect(() => {
        if (!editorRef.current || !monacoRef.current) return

        const editor = editorRef.current
        const monaco = monacoRef.current

        // We need to manage decorations
        // Ideally we should store decoration IDs in a ref, but for this implementation
        // we will find them by class name or assume a reset strategy if sticking to simplicity.
        // But the previous implementation had logic that was slightly buggy (re-adding constantly).
        // Correct approach:
        // 1. Get all current cursor decorations
        // 2. Clear them
        // 3. Add new ones

        const model = editor.getModel()
        if (!model) return;

        const currentDecorations = model.getAllDecorations()
            .filter(d => d.options.className === 'other-user-cursor')
            .map(d => d.id)

        const newDecorationsData: MonacoTypes.editor.IModelDeltaDecoration[] = []

        users.forEach(user => {
            if (user.cursor && user.id !== currentUser?.id) {
                newDecorationsData.push({
                    range: new monaco.Range(
                        user.cursor.line,
                        user.cursor.column,
                        user.cursor.line,
                        user.cursor.column
                    ),
                    options: {
                        className: 'other-user-cursor',
                        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
                        beforeContentClassName: 'other-user-cursor-marker',
                        hoverMessage: { value: user.name }
                    }
                })
            }
        })

        editor.deltaDecorations(currentDecorations, newDecorationsData)

    }, [users, currentUser])

    // Watch for theme changes and update Monaco editor
    useEffect(() => {
        if (!monacoRef.current) return
        monacoRef.current.editor.setTheme(useEditorStore.getState().theme)
    }, [useEditorStore.getState().theme])

    return (
        <Editor
            height="100%"
            language={language}
            value={code}
            theme={theme}
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: true },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
            }}
        />
    )
}
