/**
 * Библиотека для генерации структурированных данных JSON-LD
 * для улучшения SEO и отображения в поисковых системах
 */

// Базовая информация о компании
export const companyInfo = {
  name: 'RoyalTransfer',
  legalName: 'ООО "РоялТрансфер"',
  url: 'https://royaltransfer.org',
  logo: 'https://royaltransfer.org/images/logo.png',
  description: 'Трансферы из Калининграда в города Европы. Комфортабельные автомобили, опытные водители, безопасность и пунктуальность.',
  telephone: '+7 (906) 219-99-17',
  email: 'info@royaltransfer.org',
  address: {
    streetAddress: 'ул. Университетская, 2Г',
    addressLocality: 'Калининград',
    addressRegion: 'Калининградская область',
    postalCode: '236040',
    addressCountry: 'RU'
  },
  geo: {
    latitude: '54.7065',
    longitude: '20.5109'
  },
  sameAs: [
    'https://www.instagram.com/royaltransfer',
    'https://t.me/royaltransfer',
    'https://wa.me/79062199917'
  ]
};

/**
 * Генерирует структурированные данные для бизнеса
 */
export function generateLocalBusinessSchema(reviewCount: number = 0, avgRating: number = 4.8) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': companyInfo.name,
    'description': companyInfo.description,
    'image': companyInfo.logo,
    'url': companyInfo.url,
    'telephone': companyInfo.telephone,
    'email': companyInfo.email,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': companyInfo.address.streetAddress,
      'addressLocality': companyInfo.address.addressLocality,
      'addressRegion': companyInfo.address.addressRegion,
      'postalCode': companyInfo.address.postalCode,
      'addressCountry': companyInfo.address.addressCountry
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': companyInfo.geo.latitude,
      'longitude': companyInfo.geo.longitude
    },
    'priceRange': '$$',
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
      ],
      'opens': '00:00',
      'closes': '23:59'
    },
    'sameAs': companyInfo.sameAs,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': avgRating.toString(),
      'reviewCount': reviewCount.toString()
    }
  };
}

/**
 * Генерирует данные о хлебных крошках
 */
export function generateBreadcrumbSchema(breadcrumbs: {name: string, url: string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': `${companyInfo.url}${crumb.url}`
    }))
  };
}

/**
 * Генерирует данные для веб-сайта
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'url': companyInfo.url,
    'name': companyInfo.name,
    'description': companyInfo.description,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${companyInfo.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

/**
 * Генерирует данные для статьи блога
 */
export function generateBlogPostSchema(post: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.excerpt || (post.content && post.content.substring(0, 160)),
    'image': post.imageUrl || `${companyInfo.url}/images/default-blog.jpg`,
    'datePublished': post.publishedAt || post.createdAt,
    'dateModified': post.updatedAt,
    'author': {
      '@type': 'Organization',
      'name': companyInfo.name,
      'url': companyInfo.url
    },
    'publisher': {
      '@type': 'Organization',
      'name': companyInfo.name,
      'logo': {
        '@type': 'ImageObject',
        'url': companyInfo.logo
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${companyInfo.url}/blog/${post.slug}`
    },
    'inLanguage': 'ru-RU'
  };
}

/**
 * Генерирует данные для сервиса (трансфера)
 */
export function generateServiceSchema(service: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': service.name,
    'description': service.description,
    'provider': {
      '@type': 'Organization',
      'name': companyInfo.name,
      'url': companyInfo.url
    },
    'serviceType': 'TransportationService',
    'areaServed': {
      '@type': 'GeoCircle',
      'geoMidpoint': {
        '@type': 'GeoCoordinates',
        'latitude': companyInfo.geo.latitude,
        'longitude': companyInfo.geo.longitude
      },
      'geoRadius': '500 km'
    },
    'offers': {
      '@type': 'Offer',
      'price': service.price ? service.price.toString() : '0',
      'priceCurrency': 'RUB'
    }
  };
}

/**
 * Генерирует данные для FAQ (Часто задаваемые вопросы)
 */
export function generateFAQSchema(questions: {question: string, answer: string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': questions.map(q => ({
      '@type': 'Question',
      'name': q.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': q.answer
      }
    }))
  };
}

/**
 * Генерирует данные для события (например, акции или специального предложения)
 */
export function generateEventSchema(event: {
  name: string,
  description: string,
  startDate: string,
  endDate: string,
  location?: string,
  imageUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': event.name,
    'description': event.description,
    'startDate': event.startDate,
    'endDate': event.endDate,
    'image': event.imageUrl || companyInfo.logo,
    'location': {
      '@type': 'Place',
      'name': event.location || companyInfo.address.addressLocality,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': companyInfo.address.streetAddress,
        'addressLocality': companyInfo.address.addressLocality,
        'addressRegion': companyInfo.address.addressRegion,
        'postalCode': companyInfo.address.postalCode,
        'addressCountry': companyInfo.address.addressCountry
      }
    },
    'organizer': {
      '@type': 'Organization',
      'name': companyInfo.name,
      'url': companyInfo.url
    }
  };
}

/**
 * Генерирует данные для продукта (например, пакета трансфера)
 */
export function generateProductSchema(product: {
  name: string,
  description: string,
  price: number,
  imageUrl?: string,
  availability?: string,
  sku?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': product.imageUrl || companyInfo.logo,
    'sku': product.sku || `transfer-${product.name.toLowerCase().replace(/\s+/g, '-')}`,
    'brand': {
      '@type': 'Brand',
      'name': companyInfo.name
    },
    'offers': {
      '@type': 'Offer',
      'url': companyInfo.url,
      'price': product.price.toString(),
      'priceCurrency': 'RUB',
      'availability': product.availability || 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': companyInfo.name
      }
    }
  };
}

/**
 * Генерирует данные для отзыва
 */
export function generateReviewSchema(review: {
  author: string,
  datePublished: string,
  reviewBody: string,
  ratingValue: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    'itemReviewed': {
      '@type': 'LocalBusiness',
      'name': companyInfo.name,
      'image': companyInfo.logo,
      'url': companyInfo.url
    },
    'author': {
      '@type': 'Person',
      'name': review.author
    },
    'datePublished': review.datePublished,
    'reviewBody': review.reviewBody,
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': review.ratingValue,
      'bestRating': '5',
      'worstRating': '1'
    }
  };
}

/**
 * Генерирует данные для видео (если на сайте есть видеоконтент)
 */
export function generateVideoSchema(video: {
  name: string,
  description: string,
  thumbnailUrl: string,
  uploadDate: string,
  contentUrl?: string,
  embedUrl?: string,
  duration?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': video.name,
    'description': video.description,
    'thumbnailUrl': video.thumbnailUrl,
    'uploadDate': video.uploadDate,
    'contentUrl': video.contentUrl,
    'embedUrl': video.embedUrl,
    'duration': video.duration || 'PT1M', // по умолчанию 1 минута, в формате ISO 8601
    'publisher': {
      '@type': 'Organization',
      'name': companyInfo.name,
      'logo': {
        '@type': 'ImageObject',
        'url': companyInfo.logo
      }
    }
  };
}
