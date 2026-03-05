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

                const normalizedEmail = credentials.email.toLowerCase().trim();

                const { data: user, error } = await supabaseAdmin
                    .from("users")
                    .select("*")
                    .eq("email", normalizedEmail)
                    .single();

                if (error || !user) {
                    console.error("[auth] User not found:", normalizedEmail, error?.message);
                    throw new Error("Usuário não encontrado");
                }

                if (!user.password) {
                    console.error("[auth] User has no password (likely OAuth user):", normalizedEmail);
                    throw new Error("Use o login com Google para esta conta");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    console.error("[auth] Invalid password for:", normalizedEmail);
                    throw new Error("Senha incorreta");
                }

                console.log("[auth] ✅ Credentials login successful for:", normalizedEmail);
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            }
        }),
    ],
    // NOTE: Do NOT use adapter with CredentialsProvider — they are incompatible.
    // The SupabaseAdapter expects users to be created via OAuth/Email magic link,
    // but our register API inserts directly into public.users.
    // When adapter is present, NextAuth tries adapter.getUserByAccount() after
    // authorize() returns, which fails for credentials users (no accounts row).
    // Only enable adapter if you disable CredentialsProvider.
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async signIn({ user, account }: any) {
            // Always allow credentials and OAuth sign-ins
            if (account?.provider === "credentials" || account?.provider === "google") {
                return true;
            }
            return true;
        },
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
    debug: process.env.NODE_ENV === 'development',
};
