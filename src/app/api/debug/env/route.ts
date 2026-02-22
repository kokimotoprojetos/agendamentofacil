import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const envs = {
            APP_URL: process.env.APP_URL ? 'Configured ✅' : 'Missing ❌',
            EVOLUTION_API_URL: process.env.EVOLUTION_API_URL ? 'Configured ✅' : 'Missing ❌',
            EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ? 'Present (Hidden) ✅' : 'Missing ❌',
            DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? 'Present (Hidden) ✅' : 'Missing ❌',
            SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured ✅' : 'Missing ❌',
            SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present (Hidden) ✅' : 'Missing ❌',
        };

        return NextResponse.json({
            status: 'Diagnostic Report',
            timestamp: new Date().toISOString(),
            environment: envs,
            appUrlValue: process.env.APP_URL || 'not-set'
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
