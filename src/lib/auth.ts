import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { supabaseAdmin } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";

const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-') &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-');

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Credenciais inválidas");
                }

                const { data: user, error } = await supabaseAdmin
                    .from("users")
                    .select("*")
                    .eq("email", credentials.email)
                    .single();

                if (error || !user || !user.password) {
                    throw new Error("Usuário não encontrado ou senha não configurada");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Senha incorreta");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            }
        }),
    ],
    adapter: isSupabaseConfigured
        ? SupabaseAdapter({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
            secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            schema: 'public',
        } as any)
        : undefined,
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
