import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Clonado de sistemaaiprocess/src/auth.ts (mismo patrón: adapter Prisma +
// Google + JWT). Se omite el log de transacciones (logTransaction) del
// original: acá no existe todavía un TransactionLog ni bitácora de auditoría
// — no es parte del alcance de Fase 1 y no se pidió.
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true, // self-hosting (EasyPanel/VPS), mismo hosting que sistemaaiprocess
  providers: [Google],
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
});
