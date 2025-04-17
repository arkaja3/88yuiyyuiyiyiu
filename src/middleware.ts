import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Middleware для обработки запросов перед их передачей в маршруты
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Определяем публичные пути, которые не требуют аутентификации
  const isPublicPath =
    path === '/admin/login' ||
    path.startsWith('/api/auth') ||
    path.includes('/_next') ||
    path.includes('/images/') ||
    path === '/favicon.ico'

  // Путь к админ-панели
  const isAdminPath = path.startsWith('/admin')

  // Если путь относится к API аутентификации, пропускаем его без проверок
  if (path.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Получаем токен JWT из куки с фиксированным секретным ключом
  const token = await getToken({
    req,
    secret: "b3845db50fe5c5b7ad1e83d7a9b5fdc9ad09e7e67e2ebc184a5d328225a22e92"
  })

  // Если пользователь пытается получить доступ к странице авторизации, но уже авторизован,
  // перенаправляем его на страницу админ-панели
  if (isPublicPath && token && path === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Если пользователь пытается получить доступ к защищенному ресурсу админ-панели,
  // но не авторизован, перенаправляем его на страницу авторизации
  if (isAdminPath && !isPublicPath && !token) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // В остальных случаях пропускаем запрос
  return NextResponse.next()
}

// Конфигурация для указания, для каких маршрутов применять middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin',
    '/api/auth/:path*'
  ]
}
