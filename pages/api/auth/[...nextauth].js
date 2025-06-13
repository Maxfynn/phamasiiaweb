// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

// --- Prisma Singleton Pattern for Vercel ---
import { PrismaClient } from "@prisma/client";
let prisma;
if (process.env.NODE_ENV === "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
} else {
  prisma = new PrismaClient();
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { customer: true, staff: true },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          storeName: user.customer?.StoreName || user.staff?.storeName || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.storeName = user.storeName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.storeName = token.storeName;
      return session;
    },
  },
  pages: {
    signIn: '/',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});


// For Next.js pages directory (API route):
export default handler;
