'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { useStructuredData } from '@/lib/seo-hooks'
import { generateBreadcrumbSchema } from '@/lib/structuredData'

/**
 * Названия маршрутов для преобразования URL-адресов в читаемые названия
 */
const routeNameMap: Record<string, string> = {
  '': 'Главная',
  'blog': 'Блог',
  'reviews': 'Отзывы',
  'gallery': 'Галерея',
  'routes': 'Маршруты',
  'privacy-policy': 'Политика конфиденциальности',
  'contacts': 'Контакты',
  'faq': 'Вопросы и ответы',
  'about': 'О нас'
}

/**
 * Интерфейс для хлебных крошек
 */
interface BreadcrumbItem {
  text: string;
  href: string;
  isLast: boolean;
}

/**
 * Пропсы компонента хлебных крошек
 */
interface EnhancedBreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  homeText?: string;
  className?: string;
  separator?: React.ReactNode;
}

/**
 * Компонент улучшенных хлебных крошек с микроразметкой Schema.org
 */
export default function EnhancedBreadcrumbs({
  customItems,
  homeText = 'Главная',
  className = '',
  separator = <span className="mx-2 text-slate-400">/</span>
}: EnhancedBreadcrumbsProps) {
  const pathname = usePathname()

  // Функция для преобразования URL-пути в массив хлебных крошек
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // Если предоставлены пользовательские элементы, используем их
    if (customItems && customItems.length > 0) {
      return customItems
    }

    // Разбиваем путь на сегменты и фильтруем пустые строки
    const segments = pathname.split('/').filter(segment => segment.length > 0)

    // Начинаем с главной страницы
    const breadcrumbs: BreadcrumbItem[] = [
      { text: homeText, href: '/', isLast: segments.length === 0 }
    ]

    // Строим путь и добавляем сегменты как хлебные крошки
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`

      // Определяем, является ли сегмент последним
      const isLast = index === segments.length - 1

      // Получаем название для сегмента из карты маршрутов или используем сегмент как есть
      let text = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

      // Если это динамический сегмент (например, [id] или [slug])
      if (segment.startsWith('[') && segment.endsWith(']')) {
        // Для динамических сегментов можно использовать хук useParams() в Next.js,
        // но в этом примере просто заменяем на значение сегмента
        text = `Детали`
      }

      breadcrumbs.push({
        text,
        href: currentPath,
        isLast
      })
    })

    return breadcrumbs
  }

  // Генерируем хлебные крошки
  const breadcrumbs = generateBreadcrumbs()

  // Формируем данные для микроразметки Schema.org
  const breadcrumbsForSchema = breadcrumbs.map(item => ({
    name: item.text,
    url: item.href
  }))

  // Применяем микроразметку через хук useStructuredData
  useStructuredData(generateBreadcrumbSchema(breadcrumbsForSchema))

  // Применяем микроразметку через метатеги OpenGraph
  useEffect(() => {
    // Создаем метатег для URL и хлебных крошек OpenGraph
    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (!ogUrl) {
      const meta = document.createElement('meta')
      meta.setAttribute('property', 'og:url')
      meta.setAttribute('content', window.location.href)
      document.head.appendChild(meta)
    } else {
      ogUrl.setAttribute('content', window.location.href)
    }

    // Добавляем текущие хлебные крошки в og:breadcrumb
    breadcrumbs.forEach((item, index) => {
      const meta = document.createElement('meta')
      meta.setAttribute('property', `og:breadcrumb:${index}`)
      meta.setAttribute('content', item.text)
      document.head.appendChild(meta)
    })

    // Очистка при размонтировании
    return () => {
      document.querySelectorAll('meta[property^="og:breadcrumb:"]').forEach(el => {
        document.head.removeChild(el)
      })
    }
  }, [breadcrumbs])

  // Если только главная страница или нет хлебных крошек, не отображаем компонент
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <Suspense fallback={<div className="h-8 animate-pulse bg-slate-200 rounded w-full" />}>
      <nav aria-label="Хлебные крошки" className={`py-2 mb-4 ${className}`}>
        <ol className="flex flex-wrap items-center text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
          {breadcrumbs.map((item, index) => (
            <li
              key={index}
              className={`flex items-center ${item.isLast ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700'}`}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {/* Сепаратор для всех элементов кроме первого */}
              {index > 0 && separator}

              {item.isLast ? (
                <>
                  <span itemProp="name">{item.text}</span>
                  <meta itemProp="position" content={String(index + 1)} />
                </>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="hover:underline"
                    itemProp="item"
                  >
                    <span itemProp="name">{item.text}</span>
                  </Link>
                  <meta itemProp="position" content={String(index + 1)} />
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </Suspense>
  )
}
