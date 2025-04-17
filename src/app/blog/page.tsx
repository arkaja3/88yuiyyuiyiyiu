import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/prisma'
import Script from 'next/script'

// Отключаем кеширование для динамических данных
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// Определение метаданных для страницы блога
export const metadata: Metadata = {
  title: 'Блог о трансферах и путешествиях | RoyalTransfer',
  description: 'Полезные статьи о трансферах, путешествиях по Европе, советы путешественникам, обзоры популярных маршрутов и достопримечательностей.',
  alternates: {
    canonical: '/blog'
  },
  openGraph: {
    title: 'Блог о трансферах и путешествиях | RoyalTransfer',
    description: 'Полезные статьи о трансферах, путешествиях по Европе, советы путешественникам, обзоры популярных маршрутов и достопримечательностей.',
    url: '/blog',
    type: 'website'
  }
}

// Компонент для отображения отдельного поста блога в списке
function BlogPost({ post }: { post: any }) {
  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt)
  const readTime = Math.max(1, Math.ceil(post.content.length / 1000)) + ' мин'
  const defaultImage = '/images/default-blog.jpg'

  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col h-full group">
      <div className="overflow-hidden rounded-lg blog-card-hover h-full">
        <div
          className="h-60 bg-cover bg-center"
          style={{
            backgroundImage: `url(${post.imageUrl || defaultImage})`
          }}
        >
          <div className="w-full h-full flex items-end blog-overlay">
            <div className="text-white p-4">
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-1" />
                <span>{readTime}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-gray-800 flex-1">
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          <span className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center group-hover:text-blue-700 transition-colors">
            Читать полностью
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// Основной компонент страницы блога
export default async function BlogPage() {
  console.log('Rendering blog page, fetching latest posts...')

  // Получаем все опубликованные посты из базы данных с улучшенной сортировкой
  const blogPosts = await prisma.blogPost.findMany({
    where: {
      isPublished: true
    },
    orderBy: [
      // Сначала сортируем по publishedAt (если есть)
      {
        publishedAt: {
          sort: 'desc',
          nulls: 'last' // Помещаем записи без publishedAt в конец
        }
      },
      // Затем, если publishedAt одинаковы или null, сортируем по createdAt
      {
        createdAt: 'desc'
      }
    ]
  })

  console.log(`Found ${blogPosts.length} published blog posts for display`)

  // Структурированные данные для списка статей блога
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    'name': 'Блог о трансферах и путешествиях',
    'description': 'Полезные статьи о трансферах, путешествиях по Европе, советы путешественникам.',
    'url': 'https://royaltransfer.org/blog',
    'publisher': {
      '@type': 'Organization',
      'name': 'RoyalTransfer',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://royaltransfer.org/images/logo.png'
      }
    },
    'blogPosts': blogPosts.map(post => ({
      '@type': 'BlogPosting',
      'headline': post.title,
      'description': post.excerpt,
      'url': `https://royaltransfer.org/blog/${post.slug}`,
      'datePublished': post.publishedAt || post.createdAt,
      'dateModified': post.updatedAt,
      'image': post.imageUrl || '/images/default-blog.jpg',
      'author': {
        '@type': 'Organization',
        'name': 'RoyalTransfer'
      }
    }))
  }

  return (
    <>
      <Script
        id="blog-list-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-10 flex items-center">
            <Link href="/">
              <Button variant="outline" className="group mr-4">
                <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>На главную</span>
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold">Блог о путешествиях</h1>
          </div>

          {blogPosts.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-gray-500 text-xl">Скоро здесь появятся интересные статьи</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <BlogPost key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
