'use client'

import { useEffect } from 'react'

interface HrefLangEntry {
  lang: string;  // Код языка, например 'ru-RU', 'en-US'
  url: string;   // Полный URL для языковой версии
  default?: boolean; // Является ли это версией по умолчанию
}

/**
 * Хук для добавления hreflang тегов, улучшающих международный SEO
 * @param entries Массив языковых версий страницы
 */
export function useHrefLang(entries: HrefLangEntry[]) {
  useEffect(() => {
    // Находим и удаляем существующие hreflang теги, чтобы избежать дубликатов
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => {
      el.parentNode?.removeChild(el);
    });

    // Добавляем новые hreflang теги для каждой языковой версии
    entries.forEach(entry => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = entry.lang;
      link.href = entry.url;
      document.head.appendChild(link);

      // Для языка по умолчанию добавляем x-default
      if (entry.default) {
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'alternate';
        defaultLink.hreflang = 'x-default';
        defaultLink.href = entry.url;
        document.head.appendChild(defaultLink);
      }
    });

    // Удаляем при размонтировании компонента
    return () => {
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => {
        el.parentNode?.removeChild(el);
      });
    };
  }, [entries]);
}

/**
 * Хук для добавления мета-информации о регионе или стране
 */
export function useGeoMeta(country: string, region?: string) {
  useEffect(() => {
    // Удаляем существующие мета-теги геолокации
    document.querySelectorAll('meta[name="geo.region"], meta[name="geo.placename"], meta[name="geo.position"]').forEach(el => {
      el.parentNode?.removeChild(el);
    });

    // Добавляем мета-тег для региона
    if (region) {
      const regionMeta = document.createElement('meta');
      regionMeta.name = 'geo.region';
      regionMeta.content = `${country}-${region}`;
      document.head.appendChild(regionMeta);
    }

    // Добавляем мета-тег для страны
    const countryMeta = document.createElement('meta');
    countryMeta.name = 'geo.placename';
    countryMeta.content = country;
    document.head.appendChild(countryMeta);

    // Удаляем при размонтировании компонента
    return () => {
      document.querySelectorAll('meta[name="geo.region"], meta[name="geo.placename"]').forEach(el => {
        el.parentNode?.removeChild(el);
      });
    };
  }, [country, region]);
}

/**
 * Компонент для добавления разметки для языков и регионов
 */
export function InternationalSEO({
  languages,
  defaultLang = 'ru-RU',
  country = 'RU',
  region = 'KGD'
}: {
  languages: { code: string, url: string }[],
  defaultLang?: string,
  country?: string,
  region?: string
}) {
  // Преобразуем в формат, ожидаемый хуком
  const entries: HrefLangEntry[] = languages.map(lang => ({
    lang: lang.code,
    url: lang.url,
    default: lang.code === defaultLang
  }));

  useHrefLang(entries);
  useGeoMeta(country, region);

  return null; // Этот компонент не рендерит ничего видимого
}

/**
 * Генерирует JSON-LD данные для указания языковых версий для поисковых систем
 */
export function generateLanguageAlternatesData(entries: HrefLangEntry[], url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    'url': url,
    'inLanguage': entries.find(e => e.default)?.lang || entries[0].lang,
    'potentialAction': {
      '@type': 'ReadAction',
      'target': entries.map(entry => ({
        '@type': 'EntryPoint',
        'urlTemplate': entry.url,
        'inLanguage': entry.lang
      }))
    }
  };
}
