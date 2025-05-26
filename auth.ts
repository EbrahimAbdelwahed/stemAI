import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import authConfig from "./auth.config"
import { db } from "@/lib/db"

// Only use DrizzleAdapter if database is available
const authOptions = {
  ...(db ? { adapter: DrizzleAdapter(db) } : {}),
  session: { strategy: "jwt" as const },
  ...authConfig,
  callbacks: {
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions) 