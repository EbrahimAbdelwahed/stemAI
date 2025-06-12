import type { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"

export default {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Allow all sign-ins
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirect to chat page after successful sign-in
      if (url.startsWith("/")) return `${baseUrl}/chat`
      // Allows relative callback URLs
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/chat`
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnProfile = nextUrl.pathname.startsWith('/profile')
      
      if (isOnProfile) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }
      
      return true
    },
  },
} satisfies NextAuthConfig 