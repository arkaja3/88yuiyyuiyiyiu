'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type BlogPost = {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  imageUrl: string | null
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export default function BlogSection() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchFeaturedPosts = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching blog posts for home section...')

      // Добавляем параметр времени для предотвращения кеширования
      const cacheBuster = new Date().getTime()
      const response = await fetch(`/api/blog/featured?nocache=${cacheBuster}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Received ${data.blogPosts?.length || 0} blog posts for home section`)

      if (data.blogPosts && Array.isArray(data.blogPosts)) {
        if (data.blogPosts.length > 0) {
          setBlogPosts(data.blogPosts)
        } else {
          console.warn('Received empty blog posts array')
          setBlogPosts([])
        }
      } else {
        console.error('Unexpected response format:', data)
        setBlogPosts([])
      }
    } catch (error) {
      console.error('Error fetching featured blog posts:', error)
      setError(error instanceof Error ? error.message : 'Произошла ошибка при загрузке статей')
      setBlogPosts([]) // Устанавливаем пустой массив при ошибке

      // Если возникла ошибка и не превышено количество попыток, пробуем снова через секунду
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchFeaturedPosts()
        }, 1000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // При монтировании компонента загружаем данные
  useEffect(() => {
    fetchFeaturedPosts()
  }, [])

  // При изменении маршрута или ремонтировании, сбрасываем состояние и загружаем данные заново
  useEffect(() => {
    return () => {
      setBlogPosts([])
      setIsLoading(true)
      setError(null)
      setRetryCount(0)
    }
  }, [])

  // Функция для принудительного обновления данных
  const refreshData = () => {
    setBlogPosts([])
    setIsLoading(true)
    setError(null)
    setRetryCount(0)
    fetchFeaturedPosts()
  }

  // Функция для определения примерного времени чтения
  const getReadTime = (content: string) => {
    return Math.max(1, Math.ceil(content.length / 1000)) + ' мин'
  }

  // Если нет постов, не показываем секцию
  if (!isLoading && (blogPosts.length === 0 || error)) {
    console.log('No blog posts found or error occurred, not showing blog section')
    return null
  }

  // Заглушка для отсутствующего изображения
  const defaultImage = '/images/default-blog.jpg'

  return (
    <section id="blog" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Наш блог</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Полезные статьи о путешествиях, транспорте и наших услугах
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-700 blog-card-hover"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div
                      className="h-52 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${post.imageUrl || defaultImage})`
                      }}
                    >
                      <div className="w-full h-full flex items-end blog-overlay">
                        <div className="text-white p-4">
                          <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                          <div className="flex items-center text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{getReadTime(post.content)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                        Читать полностью
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/blog">
                <Button className="group">
                  <span>Все статьи</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
