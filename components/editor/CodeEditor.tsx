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
    const { code, language, users, setCode, currentUser } = useEditorStore()

    const handleEditorDidMount = (editor: MonacoTypes.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor
        monacoRef.current = monaco

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

        // Note: getAllDecorations() requires the model.
        const model = editor.getModel()
        if (!model) return;

        const currentDecorations = model.getAllDecorations()
            .filter(d => d.options.className === 'other-user-cursor')
            .map(d => d.id)

        // We use deltaDecorations to remove old AND add new in one go (or two steps).
        // deltaDecorations(oldDecorations, newDecorations) returns string[] of new IDs.

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

    return (
        <Editor
            height="100%"
            language={language}
            value={code}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: true },
                fontSize: 14,
                fontFamily: 'Fira Code, Monaco, monospace',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
            }}
        />
    )
}
