import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Определение конфигурации NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Имя пользователя", type: "text" },
        password: { label: "Пароль", type: "password" }
      },
      async authorize(credentials) {
        // Простая проверка - фиксированные логин и пароль
        if (!credentials) return null;

        // Проверка учетных данных напрямую
        const isValidCredentials =
          credentials.username === "adminroyal" &&
          credentials.password === "RoyalTransfer2025_!";

        if (isValidCredentials) {
          return {
            id: "1",
            name: "Администратор",
            email: "admin@example.com",
            role: "admin",
          };
        }

        return null;
      }
    }),
  ],
  // Используем фиксированный секретный ключ вместо переменной окружения
  secret: "b3845db50fe5c5b7ad1e83d7a9b5fdc9ad09e7e67e2ebc184a5d328225a22e92",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

// Типы для расширения стандартных типов NextAuth
declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
