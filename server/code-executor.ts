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
                    const result = await execAsync(`node "${path.join(tempDir, 'code.js')}"`, { timeout: 5000 })
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
                    const command = process.platform === 'win32' ? 'python' : 'python3'
                    const result = await execAsync(`${command} "${path.join(tempDir, 'code.py')}"`, { timeout: 5000 })
                    output = result.stdout
                    error = result.stderr
                } catch (e: any) {
                    output = e.stdout || ''
                    error = e.stderr || e.message
                }
                break

            case 'java':
                // Force class name to be Main
                await fs.writeFile(path.join(tempDir, 'Main.java'), code)
                try {
                    await execAsync(`javac "${path.join(tempDir, 'Main.java')}"`, { timeout: 5000 })
                    const result = await execAsync(`java -cp "${tempDir}" Main`, { timeout: 5000 })
                    output = result.stdout
                    error = result.stderr
                } catch (e: any) {
                    output = e.stdout || ''
                    error = e.stderr || e.message
                }
                break

            case 'c':
                await fs.writeFile(path.join(tempDir, 'code.c'), code)
                try {
                    const outPath = path.join(tempDir, 'a.out')
                    await execAsync(`gcc "${path.join(tempDir, 'code.c')}" -o "${outPath}"`, { timeout: 5000 })
                    const result = await execAsync(`"${outPath}"`, { timeout: 5000 })
                    output = result.stdout
                    error = result.stderr
                } catch (e: any) {
                    output = e.stdout || ''
                    error = e.stderr || e.message
                }
                break

            case 'cpp':
                await fs.writeFile(path.join(tempDir, 'code.cpp'), code)
                try {
                    const outPath = path.join(tempDir, 'a.out')
                    await execAsync(`g++ "${path.join(tempDir, 'code.cpp')}" -o "${outPath}"`, { timeout: 5000 })
                    const result = await execAsync(`"${outPath}"`, { timeout: 5000 })
                    output = result.stdout
                    error = result.stderr
                } catch (e: any) {
                    output = e.stdout || ''
                    error = e.stderr || e.message
                }
                break

            case 'html':
            case 'css':
                output = "HTML/CSS are rendered in the browser. \n(Backend execution not applicable for markup/style languages)"
                break

            case 'typescript':
                output = "TypeScript execution requires external compilation. Use JavaScript for immediate execution."
                break

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
