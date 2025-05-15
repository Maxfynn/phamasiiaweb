import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      isAdmin: boolean;
      jwtToken: string;
      storeName: string; // Add storeName here
    } & DefaultSession["user"];
  }
}