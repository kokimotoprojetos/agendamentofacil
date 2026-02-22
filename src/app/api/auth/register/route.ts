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
            // Check if user already has a profile
            const { data: existingProfile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('id', existingUser.id)
                .single();

            if (existingProfile) {
                return NextResponse.json({ error: 'Este email já está em uso. Por favor, faça login.' }, { status: 400 });
            }
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
        let slug = businessName.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with -
            .replace(/-+/g, '-') // Replace multiple - with single -
            .replace(/^-|-$/g, ''); // Remove leading/trailing -

        // Check if slug already exists and add random suffix if it does
        const { data: existingTenant } = await supabaseAdmin
            .from('tenants')
            .select('id')
            .eq('slug', slug)
            .single();

        if (existingTenant) {
            const randomSuffix = Math.random().toString(36).substring(2, 6);
            slug = `${slug}-${randomSuffix}`;
        }

        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert({
                business_name: businessName,
                user_id: userId,
                slug: slug
            })
            .select('id')
            .single();

        if (tenantError) throw tenantError;

        // 4. Create Profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
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
