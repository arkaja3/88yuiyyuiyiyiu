import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Логирование конфигурации
console.log("NextAuth конфигурация в [...nextauth]:");
console.log("Доступные провайдеры:", authOptions.providers.map(p => p.id));
console.log("Secret задан:", !!authOptions.secret);

// Обработчик аутентификации NextAuth для API маршрутов
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
