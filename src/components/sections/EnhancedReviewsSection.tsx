'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'
import { useStructuredData } from '@/lib/seo-hooks'
import { generateReviewSchema } from '@/lib/structuredData'
import Image from 'next/image'
import Link from 'next/link'

interface Review {
  id: string
  name: string
  rating: number
  text: string
  date: string
  imageUrl?: string
}

interface EnhancedReviewsSectionProps {
  reviews: Review[]
  title?: string
  subtitle?: string
  showAllLink?: boolean
}

// Форматирует дату для микроразметки Schema.org
const formatSchemaDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toISOString()
}

export default function EnhancedReviewsSection({
  reviews,
  title = 'Отзывы наших клиентов',
  subtitle = 'Что говорят пассажиры о наших трансферах',
  showAllLink = true
}: EnhancedReviewsSectionProps) {
  // Рассчитываем среднюю оценку для агрегированного рейтинга
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  const formattedAvgRating = avgRating.toFixed(1)

  // Создаем ref для секции отзывов
  const sectionRef = useRef<HTMLDivElement>(null)

  // Генерируем структурированные данные для каждого отзыва
  const reviewSchemas = reviews.map(review =>
    generateReviewSchema({
      author: review.name,
      datePublished: formatSchemaDate(review.date),
      reviewBody: review.text,
      ratingValue: review.rating
    })
  )

  // Генерируем агрегированный рейтинг для компании
  const aggregateRatingSchema = {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    'itemReviewed': {
      '@type': 'LocalBusiness',
      'name': 'RoyalTransfer',
      'image': 'https://royaltransfer.org/images/logo.png',
      'url': 'https://royaltransfer.org'
    },
    'ratingValue': formattedAvgRating,
    'bestRating': '5',
    'worstRating': '1',
    'ratingCount': reviews.length.toString(),
    'reviewCount': reviews.length.toString()
  }

  // Добавляем структурированные данные на страницу
  useStructuredData(aggregateRatingSchema)

  // Проверяем поддержку Intersection Observer и добавляем атрибут для ускорения загрузки
  useEffect(() => {
    if (sectionRef.current && 'IntersectionObserver' in window) {
      sectionRef.current.setAttribute('data-reviews-section', 'true')

      // Добавляем дополнительные атрибуты для SEO
      const reviewElements = sectionRef.current.querySelectorAll('.review-item')
      reviewElements.forEach((el, index) => {
        el.setAttribute('itemprop', 'review')
        el.setAttribute('data-review-id', reviews[index].id)
      })
    }
  }, [reviews])

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="py-16 bg-gray-50 dark:bg-slate-900"
      itemScope
      itemType="https://schema.org/LocalBusiness"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">{title}</h2>
          <p className="text-slate-600 dark:text-slate-300">{subtitle}</p>

          {/* Агрегированный рейтинг отображаем с микроразметкой */}
          <div className="mt-4 flex justify-center items-center" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
            <div className="flex items-center bg-white shadow-sm rounded-full px-4 py-2 mx-auto">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xl font-semibold text-slate-800" itemProp="ratingValue">{formattedAvgRating}</span>
              <span className="text-slate-500 ml-1 text-sm">из 5</span>
              <meta itemProp="bestRating" content="5" />
              <meta itemProp="worstRating" content="1" />
              <span className="ml-2 text-slate-600 text-sm">
                <span itemProp="reviewCount">{reviews.length}</span> {' '}
                {reviews.length % 10 === 1 && reviews.length % 100 !== 11 ? 'отзыв' :
                 (reviews.length % 10 >= 2 && reviews.length % 10 <= 4 && (reviews.length % 100 < 10 || reviews.length % 100 >= 20)) ? 'отзыва' : 'отзывов'}
              </span>
            </div>
          </div>
        </div>

        <Carousel className="max-w-5xl mx-auto">
          <CarouselContent>
            {reviews.map((review, index) => (
              <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3 p-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <Card className="h-full review-item" itemScope itemType="https://schema.org/Review">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex items-start mb-4">
                        {review.imageUrl ? (
                          <div className="shrink-0 mr-4">
                            <Image
                              src={review.imageUrl}
                              alt={`Фото ${review.name}`}
                              width={60}
                              height={60}
                              className="rounded-full object-cover"
                              itemProp="image"
                            />
                          </div>
                        ) : (
                          <div className="shrink-0 mr-4 w-[60px] h-[60px] bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-lg" itemProp="author">{review.name}</h4>
                          <time
                            dateTime={new Date(review.date).toISOString()}
                            className="text-sm text-slate-500 dark:text-slate-400"
                            itemProp="datePublished"
                          >
                            {new Date(review.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </time>
                        </div>
                      </div>

                      <div className="flex mb-3" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <meta itemProp="worstRating" content="1" />
                        <meta itemProp="bestRating" content="5" />
                        <meta itemProp="ratingValue" content={review.rating.toString()} />
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 flex-grow" itemProp="reviewBody">
                        {review.text}
                      </p>

                      <meta itemProp="itemReviewed" content="RoyalTransfer" />
                    </CardContent>
                  </Card>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {showAllLink && (
          <div className="text-center mt-10">
            <Link
              href="/reviews"
              className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Смотреть все отзывы
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}

        {/* Скрытая разметка для каждого отзыва для поисковых систем */}
        <div style={{ display: 'none' }} className="reviews-schema">
          {reviewSchemas.map((schema, index) => (
            <script
              key={`review-schema-${index}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
