'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

// Функция для форматирования URL изображений
function formatImageUrl(url: string | null): string {
  if (!url) return '';

  // Если URL уже полный (начинается с http:// или https://), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Если путь начинается с /, это относительный путь от корня сайта
  if (url.startsWith('/')) {
    // Добавляем текущий домен к пути
    return `${window.location.origin}${url}`;
  }

  // Если ничего не подходит, возвращаем исходный URL
  return url;
}

// Тип для отзыва из API
interface Review {
  id: number
  customerName: string
  rating: number
  comment: string
  imageUrl: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface ReviewsSectionProps {
  reviews?: Review[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  // Используем fallbackImage если imageUrl отсутствует или пустой
  const fallbackImages = [
    'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2128&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2061&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80',
  ]

  // Выбираем случайное fallback изображение на основе ID отзыва
  const fallbackImage = fallbackImages[review.id % fallbackImages.length]

  // Форматируем URL изображения с учетом типа пути
  const formattedImageUrl = typeof window !== 'undefined' ? formatImageUrl(review.imageUrl) : review.imageUrl;

  // Форматируем дату для отображения
  const formattedDate = new Date(review.createdAt).toLocaleDateString('ru-RU')

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 h-full review-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div
            className="w-12 h-12 rounded-full bg-cover bg-center mr-4"
            style={{ backgroundImage: `url(${formattedImageUrl || fallbackImage})` }}
          />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{review.customerName}</h3>
            <div className="flex items-center space-x-2">
              <StarRating rating={review.rating} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 flex-grow mb-4 relative z-10">
          {review.comment}
        </p>

        <div className="text-right">
          <Quote className="w-5 h-5 text-primary inline-block" />
        </div>
      </div>
    </motion.div>
  )
}

export default function ReviewsSection({ reviews: initialReviews }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleReviews, setVisibleReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reviewsPerPage = 3

  // Используем переданные отзывы или загружаем их из API если не переданы
  useEffect(() => {
    async function fetchReviews() {
      if (initialReviews && initialReviews.length > 0) {
        // Используем переданные с сервера отзывы
        setReviews(initialReviews)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/reviews')

        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }

        const data = await response.json()

        // Фильтруем только опубликованные отзывы
        const publishedReviews = data.filter((review: Review) => review.isPublished)
        setReviews(publishedReviews)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [initialReviews])

  // Update visible reviews when active index changes or reviews are loaded
  useEffect(() => {
    if (reviews.length > 0) {
      const startIndex = activeIndex * reviewsPerPage
      const endIndex = Math.min(startIndex + reviewsPerPage, reviews.length)
      setVisibleReviews(reviews.slice(startIndex, endIndex))
    }
  }, [activeIndex, reviews])

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(reviews.length / reviewsPerPage))

  const nextPage = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем стандартное поведение браузера
    setActiveIndex((prev) => (prev + 1) % totalPages);
  };

  const prevPage = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем стандартное поведение браузера
    setActiveIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  return (
    <section id="reviews" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-underline inline-block">
            Отзывы наших клиентов
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Мы ценим каждого клиента и постоянно работаем над улучшением нашего сервиса.
            Вот что говорят о нас те, кто уже воспользовался нашими услугами.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Пока нет отзывов. Будьте первым, кто оставит отзыв о нашем сервисе!
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {visibleReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8" id="reviews-pagination">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevPage}
                  className="rounded-full"
                  aria-label="Предыдущая страница"
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeIndex === index
                          ? 'bg-primary w-4'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveIndex(index);
                      }}
                      aria-label={`Страница ${index + 1}`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextPage}
                  className="rounded-full"
                  aria-label="Следующая страница"
                  type="button"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Кнопка "Смотреть отзывы" */}
            <div className="text-center mt-10">
              <Link href="/reviews">
                <Button className="btn-gradient text-white font-medium px-6 py-3 rounded-full group">
                  <span className="flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Смотреть отзывы
                  </span>
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
