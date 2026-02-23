import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        version: "v3-debug-injected",
        timestamp: new Date().toISOString(),
        message: "If you see this, the code is up to date."
    });
}
