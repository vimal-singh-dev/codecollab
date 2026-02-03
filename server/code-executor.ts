import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

interface ExecutionResult {
    output: string
    error?: string
    executionTime: number
}

export async function executeCode(code: string, language: string): Promise<ExecutionResult> {
    const startTime = Date.now()
    // Use os.tmpdir() for cross-platform compatibility
    const tempDir = path.join(os.tmpdir(), 'codecollab', Date.now().toString())

    try {
        await fs.mkdir(tempDir, { recursive: true })

        let output = ''
        let error: string | undefined

        switch (language) {
            case 'javascript':
                await fs.writeFile(path.join(tempDir, 'code.js'), code)
                try {
                    const result = await execAsync(`node "${path.join(tempDir, 'code.js')}"`, {
                        timeout: 5000
                    })
                    output = result.stdout
                    error = result.stderr
                } catch (e: any) {
                    output = e.stdout || ''
                    error = e.stderr || e.message
                }
                break

            case 'python':
                await fs.writeFile(path.join(tempDir, 'code.py'), code)
                try {
                    // Try python3 first, then python
                    const command = process.platform === 'win32' ? 'python' : 'python3'
                    const result = await execAsync(`${command} "${path.join(tempDir, 'code.py')}"`, {
                        timeout: 5000
                    })
                    output = result.stdout
                    error = result.stderr
                } catch (e: any) {
                    output = e.stdout || ''
                    error = e.stderr || e.message
                }
                break

            case 'typescript':
                // Bonus: TS support via ts-node if installed, or specific handling. 
                // For project scope, JS and Python are main.
                throw new Error(`Language ${language} not supported for execution yet`)

            default:
                throw new Error(`Language ${language} not supported`)
        }

        // Cleanup
        try {
            await fs.rm(tempDir, { recursive: true, force: true })
        } catch (e) {
            // ignore cleanup error
        }

        return {
            output: output || '',
            error,
            executionTime: Date.now() - startTime
        }
    } catch (error: any) {
        return {
            output: '',
            error: error.message,
            executionTime: Date.now() - startTime
        }
    }
}
