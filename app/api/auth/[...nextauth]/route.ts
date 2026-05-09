import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    // Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Credentials Login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users?email=${credentials.email}`
        )

        const users = await res.json()
        const user = users?.[0]

        if (!user) return null
        if (user.password !== credentials.password) return null

        // مهم: نرجّع البيانات المهمة بس
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || "customer",
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // JWT: نخزن البيانات هنا
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.email = user.email
      }
      return token
    },

    // Session: نرجع البيانات للفرونت
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
        name: token.name as string,
        email: token.email as string,
      }

      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }