import { NextRequest, NextResponse } from 'next/server'

// Ключ для IndexNow - в реальной системе должен быть уникальным и храниться безопасно
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'your-indexnow-key'
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://royaltransfer.org'

/**
 * API-роут для протокола IndexNow - позволяет мгновенно оповещать поисковые системы
 * о новых или обновлённых страницах сайта
 *
 * Поддерживаемые методы:
 * - GET: возвращает файл-подтверждение для валидации ключа IndexNow
 * - POST: отправляет запрос на индексацию новых/обновленных URL-адресов
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get('key')

  // Проверяем, запрашивается ли файл-подтверждение
  if (key && key === INDEXNOW_KEY) {
    return new NextResponse(key, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }

  // Если ключ не соответствует или не предоставлен, возвращаем 404
  return NextResponse.json(
    { error: 'Not found' },
    { status: 404 }
  )
}

/**
 * Обработчик POST-запросов для отправки уведомлений в поисковые системы
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Проверяем наличие необходимых параметров
    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return NextResponse.json(
        { error: 'Missing required parameter: urls' },
        { status: 400 }
      )
    }

    // Ограничиваем количество URL-адресов в одном запросе
    const urls = body.urls.slice(0, 10000)

    // Формируем запрос к серверам IndexNow
    const indexNowServers = [
      'https://www.bing.com/indexnow',
      'https://yandex.com/indexnow'
    ]

    // Отправляем запросы к серверам IndexNow
    try {
      const responses = await Promise.all(
        indexNowServers.map(server =>
          fetch(`${server}?key=${INDEXNOW_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              host: new URL(baseUrl).hostname,
              key: INDEXNOW_KEY,
              urlList: urls,
              keyLocation: `${baseUrl}/api/indexnow?key=${INDEXNOW_KEY}`
            }),
          })
        )
      )

      // Проверяем статусы ответов
      const results = await Promise.all(
        responses.map(async (response, index) => {
          const status = response.status
          let data

          try {
            data = await response.json()
          } catch (e) {
            data = await response.text()
          }

          return {
            server: indexNowServers[index],
            status,
            data
          }
        })
      )

      // Возвращаем результаты отправки
      return NextResponse.json({
        success: true,
        results
      })
    } catch (fetchError) {
      console.error('Error sending IndexNow requests:', fetchError)
      return NextResponse.json(
        { error: 'Error sending IndexNow requests', details: fetchError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing IndexNow request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Вспомогательная функция для публикации изменений в IndexNow
 * @param urls список URL-адресов для индексации
 */
export async function notifyIndexNow(urls: string[]) {
  try {
    // Проверяем, что URL начинаются с http
    const validUrls = urls.filter(url => url.startsWith('http'))

    // Если нет валидных URL, ничего не делаем
    if (validUrls.length === 0) {
      return { success: false, message: 'No valid URLs provided' }
    }

    // Отправляем запрос к нашему API
    const response = await fetch(`${baseUrl}/api/indexnow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls: validUrls }),
    })

    if (!response.ok) {
      throw new Error(`Failed to notify IndexNow: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error notifying IndexNow:', error)
    return { success: false, error: error.message }
  }
}
