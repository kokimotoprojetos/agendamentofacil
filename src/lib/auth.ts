import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "@/lib/supabase-admin";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
    providers: [
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
