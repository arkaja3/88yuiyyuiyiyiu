'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Хук для отслеживания изменения маршрутов и оповещения
 * аналитических систем при переходе между страницами
 */
export function usePageViewTracking() {
  const pathname = usePathname()

  useEffect(() => {
    // Отслеживание просмотра страницы для Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const pageView = (url: string) => {
        // @ts-ignore
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
          page_path: url,
        })
      }
      pageView(pathname)
    }

    // Отслеживание для Яндекс.Метрики
    if (typeof window !== 'undefined' && 'ym' in window) {
      // @ts-ignore
      window.ym(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID, 'hit', pathname)
    }
  }, [pathname])
}

/**
 * Хук для добавления и удаления микроразметки данных на странице
 */
export function useStructuredData(jsonLdData: object) {
  useEffect(() => {
    // Создаем Script элемент
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(jsonLdData)
    script.id = `structured-data-${Math.random().toString(36).substring(2, 9)}`

    // Добавляем в документ
    document.head.appendChild(script)

    return () => {
      // Удаляем при размонтировании компонента
      const existingScript = document.getElementById(script.id)
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [jsonLdData])
}

/**
 * Хук для управления инструкциями для поисковых систем
 */
export function useRobotsControl(options: {
  noindex?: boolean;
  nofollow?: boolean;
  noarchive?: boolean;
  noimageindex?: boolean;
}) {
  useEffect(() => {
    // Создаем или получаем существующий meta robots тег
    let robotsTag = document.querySelector('meta[name="robots"]')

    if (!robotsTag) {
      robotsTag = document.createElement('meta')
      robotsTag.setAttribute('name', 'robots')
      document.head.appendChild(robotsTag)
    }

    // Формируем содержимое
    const directives: string[] = []

    if (options.noindex) directives.push('noindex')
    else directives.push('index')

    if (options.nofollow) directives.push('nofollow')
    else directives.push('follow')

    if (options.noarchive) directives.push('noarchive')
    if (options.noimageindex) directives.push('noimageindex')

    // Устанавливаем атрибут content
    robotsTag.setAttribute('content', directives.join(', '))

    return () => {
      // При размонтировании компонента, восстанавливаем index, follow
      if (robotsTag) {
        robotsTag.setAttribute('content', 'index, follow')
      }
    }
  }, [options])
}

/**
 * Хук для управления каноническими URL
 */
export function useCanonicalUrl(url: string) {
  useEffect(() => {
    // Ищем существующий канонический тег
    let canonicalTag = document.querySelector('link[rel="canonical"]')

    // Если его нет, создаем новый
    if (!canonicalTag) {
      canonicalTag = document.createElement('link')
      canonicalTag.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalTag)
    }

    // Устанавливаем URL
    canonicalTag.setAttribute('href', url.startsWith('http')
      ? url
      : `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`)

    return () => {
      // При размонтировании компонента можно удалить тег или оставить его
      // Обычно лучше оставить, чтобы страница всегда имела канонический URL
    }
  }, [url])
}
