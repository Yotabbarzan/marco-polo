import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("Auth attempt for:", credentials?.email)
          
          const validatedFields = loginSchema.safeParse(credentials)

          if (!validatedFields.success) {
            console.log("Validation failed:", validatedFields.error)
            return null
          }

          const { email, password } = validatedFields.data

          const user = await prisma.user.findUnique({
            where: { email }
          })

          console.log("User found:", user ? "yes" : "no")
          console.log("Email verified:", user?.emailVerified ? "yes" : "no")
          console.log("Has password:", user?.password ? "yes" : "no")

          if (!user || !user.emailVerified || !user.password) {
            console.log("Auth failed: missing user, verification, or password")
            return null
          }

          // Compare password with hashed password
          const passwordsMatch = await bcrypt.compare(password, user.password)
          console.log("Password match:", passwordsMatch)
          
          if (passwordsMatch) {
            console.log("Auth successful for:", email)
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            }
          }

          console.log("Auth failed: password mismatch")
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
})