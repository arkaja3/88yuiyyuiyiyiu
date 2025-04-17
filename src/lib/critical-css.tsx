'use client'

import React, { useEffect } from 'react'

/**
 * Компонент для оптимизации загрузки CSS с целью улучшения Core Web Vitals
 * Используется для встраивания критических стилей и отложенной загрузки некритических стилей
 */
export default function CriticalCSS({
  children,
  criticalStyles
}: {
  children?: React.ReactNode,
  criticalStyles?: string
}) {
  // Встраивание критических стилей и оптимизация загрузки
  useEffect(() => {
    // Функция для предзагрузки шрифтов
    const preloadFonts = () => {
      const fonts = [
        // Inter - основной шрифт
        {
          href: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.woff2',
          type: 'font/woff2',
          crossOrigin: 'anonymous'
        },
        // Дополнительные шрифты при необходимости
      ]

      fonts.forEach(font => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'font'
        link.href = font.href
        link.type = font.type
        if (font.crossOrigin) {
          link.crossOrigin = font.crossOrigin
        }
        document.head.appendChild(link)
      })
    }

    // Функция для отложенной загрузки некритических CSS
    const loadDeferredStyles = () => {
      const styleSheets = [
        // Некритические стили, которые можно загрузить с задержкой
        '/styles/animations.css',
        '/styles/print.css'
      ]

      styleSheets.forEach(sheet => {
        // Проверяем, загружена ли уже таблица стилей
        if (!document.querySelector(`link[href="${sheet}"]`)) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = sheet
          link.media = 'print'
          link.onload = function() {
            // После загрузки меняем media на 'all', чтобы применить стили
            link.media = 'all'
          }
          document.head.appendChild(link)
        }
      })
    }

    // Оптимизация для Core Web Vitals - Largest Contentful Paint (LCP)
    const optimizeLCP = () => {
      // Добавляем атрибуты fetchpriority для LCP изображений
      const images = document.querySelectorAll('img[data-lcp="true"]')
      images.forEach(img => {
        img.setAttribute('fetchpriority', 'high')
        img.setAttribute('loading', 'eager')

        // Предзагрузка больших LCP изображений
        const src = img.getAttribute('src')
        if (src && src.startsWith('http')) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = src
          document.head.appendChild(link)
        }
      })
    }

    // Оптимизация для Core Web Vitals - First Input Delay (FID) и Interaction to Next Paint (INP)
    const optimizeInteractivity = () => {
      // Отложенная загрузка сторонних скриптов
      const deferScripts = () => {
        const thirdPartyScripts = [
          // Список URL-адресов сторонних скриптов, которые можно загрузить с задержкой
          // 'https://example.com/widget.js'
        ]

        thirdPartyScripts.forEach(scriptUrl => {
          // Проверяем, загружен ли уже скрипт
          if (!document.querySelector(`script[src="${scriptUrl}"]`)) {
            const script = document.createElement('script')
            script.src = scriptUrl
            script.async = true
            script.defer = true

            // Добавляем скрипт в конец body с задержкой
            setTimeout(() => {
              document.body.appendChild(script)
            }, 3000) // 3 секунды задержки
          }
        })
      }

      // Вызываем с задержкой после загрузки страницы
      if (document.readyState === 'complete') {
        deferScripts()
      } else {
        window.addEventListener('load', deferScripts)
      }
    }

    // Оптимизация для Core Web Vitals - Cumulative Layout Shift (CLS)
    const optimizeCLS = () => {
      // Задаем явные размеры для изображений и iframe
      document.querySelectorAll('img:not([width]):not([height]), iframe:not([width]):not([height])')
        .forEach(el => {
          if (el instanceof HTMLImageElement) {
            // Если размеры не указаны, устанавливаем стандартные (временно)
            if (!el.width && !el.height) {
              el.style.aspectRatio = '16/9'
              el.style.width = '100%'
              el.style.height = 'auto'
            }
          } else if (el instanceof HTMLIFrameElement) {
            el.style.width = '100%'
            el.style.height = '400px'
          }
        })
    }

    // Применение критических стилей
    if (criticalStyles) {
      const style = document.createElement('style')
      style.appendChild(document.createTextNode(criticalStyles))
      document.head.appendChild(style)
    }

    // Вызываем оптимизационные функции
    preloadFonts()

    // Отложенная загрузка некритических стилей
    if (document.readyState === 'complete') {
      loadDeferredStyles()
      optimizeLCP()
      optimizeCLS()
      optimizeInteractivity()
    } else {
      window.addEventListener('load', () => {
        loadDeferredStyles()
        optimizeLCP()
        optimizeCLS()
        optimizeInteractivity()
      })
    }

    // Добавляем слушатели для измерения производительности
    if ('PerformanceObserver' in window) {
      try {
        // Измерение LCP (Largest Contentful Paint)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            const lcpTime = lastEntry.startTime
            console.log('LCP:', lcpTime.toFixed(2), 'ms')

            // Можно отправить данные в аналитику
            if ('gtag' in window) {
              // @ts-ignore
              window.gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'LCP',
                value: Math.round(lcpTime),
                non_interaction: true,
              })
            }
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true })

        // Измерение CLS (Cumulative Layout Shift)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          let clsScore = 0

          entries.forEach(entry => {
            // @ts-ignore - CLS не включен в типы TS
            if (!entry.hadRecentInput) {
              // @ts-ignore
              clsScore += entry.value
            }
          })

          console.log('CLS:', clsScore.toFixed(4))

          // Можно отправить данные в аналитику
          if ('gtag' in window) {
            // @ts-ignore
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'CLS',
              value: Math.round(clsScore * 1000),
              non_interaction: true,
            })
          }
        }).observe({ type: 'layout-shift', buffered: true })

        // Измерение FID (First Input Delay)
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach(entry => {
            const fidTime = entry.processingStart - entry.startTime
            console.log('FID:', fidTime.toFixed(2), 'ms')

            // Можно отправить данные в аналитику
            if ('gtag' in window) {
              // @ts-ignore
              window.gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'FID',
                value: Math.round(fidTime),
                non_interaction: true,
              })
            }
          })
        }).observe({ type: 'first-input', buffered: true })
      } catch (e) {
        console.error('Error setting up PerformanceObserver:', e)
      }
    }

  }, [criticalStyles])

  return <>{children}</>
}
