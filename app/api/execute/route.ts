import { NextRequest, NextResponse } from 'next/server'
import { executeCode } from '@/server/code-executor'

export async function POST(req: NextRequest) {
    try {
        const { code, language } = await req.json()

        if (!code || !language) {
            return NextResponse.json(
                { error: 'Code and language are required' },
                { status: 400 }
            )
        }

        const result = await executeCode(code, language)

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
