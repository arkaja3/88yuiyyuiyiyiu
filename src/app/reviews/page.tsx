'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload, FileUploadItem } from '@/components/ui/file-upload'
import { PostImageUpload } from '@/components/ui/postimage-upload'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { normalizeImagePath } from '@/lib/utils'

// Тип для отзыва из API
interface Review {
  id: number
  customerName: string
  rating: number
  comment: string
  imageUrl: string | null
  reviewImageUrl: string | null
  videoUrl: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

// Компонент рейтинга звездами
function StarRating({
  rating,
  onRatingChange
}: {
  rating: number,
  onRatingChange?: (rating: number) => void
}) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          } ${onRatingChange ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => onRatingChange && onRatingChange(star)}
        />
      ))}
    </div>
  )
}

// Компонент отображения отзыва
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

  // Форматируем дату для отображения
  const formattedDate = new Date(review.createdAt).toLocaleDateString('ru-RU')

  // Используем функцию нормализации для изображений
  const avatarUrl = normalizeImagePath(review.imageUrl || fallbackImage);
  const reviewImageUrl = normalizeImagePath(review.reviewImageUrl);

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
            style={{ backgroundImage: `url(${avatarUrl})` }}
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

        {/* Изображение отзыва, если есть */}
        {review.reviewImageUrl && (
          <div className="mt-4 mb-4">
            <img
              src={reviewImageUrl}
              alt="Фото к отзыву"
              className="rounded-lg w-full h-auto max-h-48 object-cover"
              onError={(e) => {
                console.error(`Ошибка загрузки изображения отзыва: ${reviewImageUrl}`);
                // Показываем плейсхолдер
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Ошибка загрузки изображения</dGV4dD48L3N2Zz4=';
              }}
            />
          </div>
        )}

        {/* Видео отзыва, если есть */}
        {review.videoUrl && (
          <div className="mt-4 mb-4">
            <iframe
              src={review.videoUrl}
              className="rounded-lg w-full"
              height="200"
              frameBorder="0"
              allowFullScreen
              title="Видео отзыв"
            ></iframe>
          </div>
        )}

        <div className="text-right">
          <Quote className="w-5 h-5 text-primary inline-block" />
        </div>
      </div>
    </motion.div>
  )
}

// Форма отправки нового отзыва
function ReviewForm() {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [reviewImageUrl, setReviewImageUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !comment) {
      toast.error("Пожалуйста, заполните имя и текст отзыва")
      return
    }

    try {
      setSubmitting(true)

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: name,
          rating,
          comment,
          imageUrl: imageUrl || null,
          reviewImageUrl: reviewImageUrl || null,
          videoUrl: videoUrl || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      // Очистить форму
      setName('')
      setRating(5)
      setComment('')
      setImageUrl('')
      setReviewImageUrl('')
      setVideoUrl('')

      toast.success("Спасибо за отзыв! Ваш отзыв будет опубликован после проверки модератором.")
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error("Не удалось отправить отзыв. Пожалуйста, попробуйте позже.")
    } finally {
      setSubmitting(false)
    }
  }

  // Обработчик загрузки изображений
  const handleImageUpload = (url: string) => {
    console.log("Полученный URL аватара:", url);
    setImageUrl(url);
  }

  // Обработчик загрузки изображений для отзыва
  const handleReviewImageUpload = (url: string) => {
    console.log("Полученный URL изображения отзыва:", url);
    setReviewImageUrl(url);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Оставить отзыв</h3>

      <div className="space-y-2">
        <Label htmlFor="name">Ваше имя</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Иван Иванов"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rating">Оценка</Label>
        <div id="rating">
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Текст отзыва</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Напишите ваш отзыв о нашем сервисе..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUpload">Ваша фотография (необязательно)</Label>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <PostImageUpload
              onUploadComplete={handleImageUpload}
              buttonLabel="Загрузить фото"
              tags={["royaltransfer", "avatar", "review"]}
              description="Фото пользователя для отзыва"
            />
          </div>
          <div>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Или укажите URL изображения..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Можно указать URL вашей фотографии вместо загрузки
            </p>
          </div>
        </div>
        {imageUrl && (
          <div className="mt-2 flex items-center">
            <img
              src={imageUrl}
              alt="Предпросмотр"
              className="w-10 h-10 object-cover rounded-full mr-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="text-xs">Ваша фотография</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviewImageUpload">Фотография к отзыву (необязательно)</Label>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <PostImageUpload
              onUploadComplete={handleReviewImageUpload}
              buttonLabel="Загрузить фото к отзыву"
              tags={["royaltransfer", "review_image"]}
              description="Фотография к отзыву клиента"
            />
          </div>
          <div>
            <Input
              id="reviewImageUrl"
              value={reviewImageUrl}
              onChange={(e) => setReviewImageUrl(e.target.value)}
              placeholder="Или укажите URL изображения..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Можно указать URL изображения вместо загрузки
            </p>
          </div>
        </div>
        {reviewImageUrl && (
          <div className="mt-2 flex items-center">
            <img
              src={reviewImageUrl}
              alt="Предпросмотр"
              className="w-16 h-10 object-cover rounded mr-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="text-xs">Фото к отзыву</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">URL видео отзыва (необязательно)</Label>
        <Input
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/embed/video-id"
        />
        <p className="text-xs text-gray-500 mt-1">
          Поддерживаются ссылки на YouTube в формате https://youtube.com/embed/ID_ВИДЕО
        </p>
      </div>

      <Button type="submit" className="w-full btn-gradient text-white" disabled={submitting}>
        {submitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Отправка...
          </span>
        ) : (
          <span className="flex items-center">
            <Send className="w-4 h-4 mr-2" />
            Отправить отзыв
          </span>
        )}
      </Button>
    </form>
  )
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const reviewsPerPage = 6

  // Загрузка отзывов из API
  useEffect(() => {
    async function fetchReviews() {
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
        console.error('Error loading reviews:', err)
        setError('Не удалось загрузить отзывы')
        toast.error("Не удалось загрузить отзывы")
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // Вычисляем отзывы для текущей страницы
  const getCurrentPageReviews = () => {
    const startIdx = activeIndex * reviewsPerPage
    const endIdx = Math.min(startIdx + reviewsPerPage, reviews.length)
    return reviews.slice(startIdx, endIdx)
  }

  // Общее количество страниц
  const totalPages = Math.max(1, Math.ceil(reviews.length / reviewsPerPage))

  // Функции для пагинации
  const nextPage = () => {
    setActiveIndex((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setActiveIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 heading-underline inline-block">
              Отзывы клиентов
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Мы ценим мнение каждого клиента и постоянно работаем над улучшением качества нашего сервиса.
              Ваш отзыв поможет нам стать лучше!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  {error}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                  <h3 className="text-xl font-bold mb-4">Пока нет отзывов</h3>
                  <p>Будьте первым, кто оставит отзыв о нашем сервисе!</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {getCurrentPageReviews().map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>

                  {/* Пагинация */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-8">
                      <Button
                        variant="outline"
                        onClick={prevPage}
                        className="rounded-md"
                        aria-label="Предыдущая страница"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Назад
                      </Button>

                      <div className="text-sm">
                        Страница {activeIndex + 1} из {totalPages}
                      </div>

                      <Button
                        variant="outline"
                        onClick={nextPage}
                        className="rounded-md"
                        aria-label="Следующая страница"
                      >
                        Далее
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <ReviewForm />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
