'use client'

import { useEffect } from 'react'
import Script from 'next/script'

/**
 * Компонент для загрузки аналитических скриптов
 * Расширенная настройка Google Analytics, Яндекс.Метрики и других систем аналитики
 */
export default function AnalyticsScripts() {
  // ID должны быть установлены в переменных окружения
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
  const VK_PIXEL_ID = process.env.NEXT_PUBLIC_VK_PIXEL_ID
  const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

  // Для отслеживания времени загрузки страницы и других метрик производительности
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Отслеживание времени загрузки страницы
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          const pageLoadTime = timing.loadEventEnd - timing.navigationStart;

          // Отправляем данные в GA, если ID установлен
          if (GA_MEASUREMENT_ID && 'gtag' in window) {
            // @ts-ignore
            window.gtag('event', 'timing_complete', {
              name: 'page_load',
              value: pageLoadTime,
              event_category: 'Performance'
            });
          }

          // Отправляем данные в Яндекс.Метрику, если ID установлен
          if (YANDEX_METRIKA_ID && 'ym' in window) {
            // @ts-ignore
            window.ym(YANDEX_METRIKA_ID, 'params', {
              'page_load_time': pageLoadTime
            });
          }

          // Сохраняем метрики в localStorage для дальнейшего анализа
          try {
            const performanceData = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
            performanceData.push({
              page: window.location.pathname,
              loadTime: pageLoadTime,
              timestamp: new Date().toISOString()
            });

            // Храним только последние 10 измерений
            if (performanceData.length > 10) {
              performanceData.shift();
            }

            localStorage.setItem('performance_metrics', JSON.stringify(performanceData));
          } catch (e) {
            console.error('Error saving performance metrics:', e);
          }
        }, 0);
      });

      // Отслеживание видимых секций для улучшения контентной стратегии
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const sectionId = entry.target.id || entry.target.getAttribute('data-section-id');
                if (sectionId) {
                  // Отправляем событие просмотра секции в GA
                  if (GA_MEASUREMENT_ID && 'gtag' in window) {
                    // @ts-ignore
                    window.gtag('event', 'section_view', {
                      'event_category': 'Content',
                      'event_label': sectionId
                    });
                  }

                  // Отправляем событие в Яндекс.Метрику
                  if (YANDEX_METRIKA_ID && 'ym' in window) {
                    // @ts-ignore
                    window.ym(YANDEX_METRIKA_ID, 'reachGoal', 'section_view', { section: sectionId });
                  }
                }
              }
            });
          },
          { threshold: 0.3 } // Секция считается просмотренной, если видно 30% её содержимого
        );

        // Наблюдаем за всеми секциями на странице
        setTimeout(() => {
          document.querySelectorAll('section[id], div[data-section-id]').forEach(
            section => observer.observe(section)
          );
        }, 1000);
      }
    }
  }, [GA_MEASUREMENT_ID, YANDEX_METRIKA_ID]);

  return (
    <>
      {/* Google Analytics - расширенная конфигурация */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                cookie_flags: 'samesite=none;secure',
                anonymize_ip: true,
                allow_display_features: false,
                send_page_view: true,
                link_attribution: true,
                optimize_id: '${process.env.NEXT_PUBLIC_GA_OPTIMIZE_ID || ''}',
                custom_map: {
                  dimension1: 'client_id',
                  dimension2: 'engagement_time_msec',
                }
              });

              // Отслеживаем скорость загрузки страницы
              gtag('event', 'page_view', {
                'send_to': '${GA_MEASUREMENT_ID}',
                'page_title': document.title,
                'page_location': window.location.href,
                'page_path': window.location.pathname,
              });

              // Отслеживаем клики по телефону и email
              document.addEventListener('click', function(e) {
                const target = e.target;
                if (target && target.tagName === 'A') {
                  const href = target.getAttribute('href');
                  if (href) {
                    if (href.startsWith('tel:')) {
                      gtag('event', 'phone_click', {
                        'event_category': 'Contact',
                        'event_label': href.replace('tel:', '')
                      });
                    } else if (href.startsWith('mailto:')) {
                      gtag('event', 'email_click', {
                        'event_category': 'Contact',
                        'event_label': href.replace('mailto:', '')
                      });
                    }
                  }
                }
              });
            `}
          </Script>
        </>
      )}

      {/* Яндекс.Метрика - расширенная конфигурация */}
      {YANDEX_METRIKA_ID && (
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(${YANDEX_METRIKA_ID}, "init", {
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true,
              webvisor: true,
              trackHash: true,
              ecommerce: "dataLayer",
              defer: true,
              triggerEvent: true
            });

            // Настраиваем отслеживание форм
            document.addEventListener('submit', function(e) {
              if (e.target && e.target.tagName === 'FORM') {
                const formId = e.target.id || e.target.getAttribute('name') || 'unknown_form';
                ym(${YANDEX_METRIKA_ID}, 'reachGoal', 'form_submit', {form_id: formId});
              }
            });

            // Настраиваем отслеживание времени на странице
            let startTime = new Date();
            window.addEventListener('beforeunload', function() {
              let endTime = new Date();
              let timeSpent = (endTime.getTime() - startTime.getTime()) / 1000;
              ym(${YANDEX_METRIKA_ID}, 'params', {
                'time_spent': timeSpent,
                'page': window.location.pathname
              });
            });
          `}
        </Script>
      )}

      {/* VK Pixel */}
      {VK_PIXEL_ID && (
        <Script id="vk-pixel" strategy="afterInteractive">
          {`
            !function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://vk.com/js/api/openapi.js?169",t.onload=function(){VK.Retargeting.Init("${VK_PIXEL_ID}"),VK.Retargeting.Hit()},document.head.appendChild(t)}();
          `}
        </Script>
      )}

      {/* Facebook Pixel */}
      {FB_PIXEL_ID && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Общие скрипты для индексации и оптимизации */}
      <Script id="indexation-meta" strategy="beforeInteractive">
        {`
          // Создание динамического meta для ускорения индексации
          const metaIndexNow = document.createElement('meta');
          metaIndexNow.name = 'indexnow';
          metaIndexNow.content = 'ready-for-instant-indexing';
          document.head.appendChild(metaIndexNow);

          // Функция для отправки IndexNow запросов поисковым системам
          function notifySearchEngines() {
            if (!navigator.onLine) return; // Проверяем подключение к интернету

            // Проверяем, было ли уже отправлено уведомление для этой страницы
            const sentPages = JSON.parse(localStorage.getItem('indexnow_sent') || '{}');
            const pagePath = window.location.pathname;

            // Если страница уже отправлялась в течение последних 3 дней, пропускаем
            if (sentPages[pagePath] && (new Date().getTime() - sentPages[pagePath]) < 259200000) {
              return;
            }

            // Помечаем страницу как отправленную
            sentPages[pagePath] = new Date().getTime();
            localStorage.setItem('indexnow_sent', JSON.stringify(sentPages));

            // Здесь можно добавить логику для отправки IndexNow запросов
            // Обычно это делается через серверный API
          }

          // Вызываем функцию с задержкой после загрузки страницы
          window.addEventListener('load', function() {
            setTimeout(notifySearchEngines, 3000);
          });

          // Оптимизация для PageSpeed
          document.documentElement.classList.remove('no-js');
          document.documentElement.classList.add('js');
        `}
      </Script>
    </>
  )
}
