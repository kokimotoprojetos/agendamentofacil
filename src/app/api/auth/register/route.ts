import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, email, password, businessName } = await request.json();

        if (!name || !email || !password || !businessName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Check if user already exists in public.users
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        let userId: string;

        if (existingUser) {
            userId = existingUser.id;
        } else {
            // 2. Create user in public.users
            const hashedPassword = await bcrypt.hash(password, 10);
            const { data: newUser, error: userError } = await supabaseAdmin
                .from('users')
                .insert({
                    name,
                    email,
                    password: hashedPassword
                })
                .select('id')
                .single();

            if (userError) throw userError;
            userId = newUser.id;
        }

        // 3. Create Tenant
        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert({
                business_name: businessName,
                user_id: userId,
                slug: businessName.toLowerCase().replace(/ /g, '-')
            })
            .select('id')
            .single();

        if (tenantError) throw tenantError;

        // 4. Create Profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                tenant_id: tenant.id,
                full_name: name,
                role: 'owner'
            });

        if (profileError) throw profileError;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Registration API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
