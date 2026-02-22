const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

async function diagnose() {
    console.log('--- DIAGNOSIS START ---');

    // Manual .env.local parser
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value.length > 0) {
                process.env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
            }
        });
        console.log('✅ Loaded .env.local');
    } else {
        console.error('❌ .env.local NOT FOUND');
    }

    const checks = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'MISSING',
        EVOLUTION_API_URL: process.env.EVOLUTION_API_URL,
        EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ? 'Present' : 'MISSING',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Present' : 'MISSING',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL
    };

    console.log('Environment Variables Check:', JSON.stringify(checks, null, 2));

    // 1. Check Supabase
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase')) {
            console.error('❌ Supabase URL is placeholder or missing');
        } else {
            const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
            const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
            if (error) throw error;
            console.log('✅ Supabase Connection: SUCCESS');
        }
    } catch (e) {
        console.error('❌ Supabase Connection: FAILED', e.message);
    }

    // 2. Check Evolution API
    try {
        const evolutionUrl = process.env.EVOLUTION_API_URL;
        const evolutionKey = process.env.EVOLUTION_API_KEY;

        if (!evolutionUrl || evolutionUrl.includes('example.com') || evolutionUrl.includes('evolution.com') || evolutionUrl.includes('your-')) {
            console.error('❌ Evolution API: URL seems to be a placeholder or invalid:', evolutionUrl);
        } else {
            try {
                const response = await axios.get(`${evolutionUrl}/instance/fetchInstances`, {
                    headers: { 'apikey': evolutionKey }
                });
                console.log('✅ Evolution API Connection: SUCCESS', response.status);
            } catch (apiErr) {
                console.error('❌ Evolution API Connection: FAILED', apiErr.message);
                if (apiErr.response) {
                    console.error('Status:', apiErr.response.status, 'Data:', JSON.stringify(apiErr.response.data));
                }
            }
        }
    } catch (e) {
        console.error('❌ Evolution API Diagnosis logic error:', e.message);
    }

    console.log('--- DIAGNOSIS END ---');
}

diagnose();
