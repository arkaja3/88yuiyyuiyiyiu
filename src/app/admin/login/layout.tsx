import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход в админ-панель | Royal Transfer",
  description: "Страница авторизации для админ-панели Royal Transfer",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
