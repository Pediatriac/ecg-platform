// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("=== AUTH ATTEMPT ===")
          console.log("Email:", credentials?.email)

          if (!credentials?.email || !credentials?.password) {
            console.log("ERROR: Missing credentials")
            return null
          }

          // Test database connection
          console.log("Connecting to database...")
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          console.log("User found:", user ? "YES" : "NO")

          if (!user) {
            console.log("ERROR: No user found for:", credentials.email)
            return null
          }

          console.log("User role:", user.role)
          console.log("Password hash exists:", !!user.password)
          console.log("Hash preview:", user.password?.substring(0, 7))

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log("Password match:", passwordMatch)

          if (!passwordMatch) {
            console.log("ERROR: Wrong password for:", credentials.email)
            return null
          }

          console.log("=== AUTH SUCCESS ===")

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (err) {
          console.error("=== AUTH EXCEPTION ===", err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id   = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id   = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  debug: true, // ← shows extra NextAuth logs in terminal
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }