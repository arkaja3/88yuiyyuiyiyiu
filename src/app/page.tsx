import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import BenefitsSection from '@/components/sections/BenefitsSection'
import ReviewsSection from '@/components/sections/ReviewsSection'
import RoutesSection from '@/components/sections/RoutesSection'
import VehiclesSection from '@/components/sections/VehiclesSection'
import BlogSection from '@/components/sections/BlogSection'
import CTA from '@/components/sections/CTA'
import ContactsSection from '@/components/sections/ContactsSection'
import GalleryHomeSection from '@/components/gallery/GalleryHomeSection'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import prisma from '@/lib/prisma'
import Script from 'next/script'
import {
  generateLocalBusinessSchema,
  generateWebsiteSchema,
  generateBreadcrumbSchema
} from '@/lib/structuredData'

// Изменяем на динамическую генерацию страницы
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// Метаданные для главной страницы
export const metadata: Metadata = {
  title: 'RoyalTransfer - Комфортные трансферы из Калининграда в Европу',
  description: 'Трансферы из Калининграда в города Европы: Гданьск, Варшава, Берлин. Комфортабельные автомобили, опытные водители, безопасность и пунктуальность.',
  alternates: {
    canonical: '/',
  },
}

// Получаем отзывы
async function getReviews() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return reviews
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error)
    return []
  }
}

export default async function Home() {
  const reviews = await getReviews()

  // Получаем структурированные данные с помощью нашей библиотеки
  const localBusinessSchema = generateLocalBusinessSchema(reviews.length, 4.8)
  const websiteSchema = generateWebsiteSchema()
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Главная', url: '/' }
  ])

  return (
    <>
      <Script
        id="local-business-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <main className="flex flex-col min-h-screen">
        <HeroSection />
        <RoutesSection />
        <VehiclesSection />
        <BenefitsSection />
        <GalleryHomeSection />
        <ReviewsSection reviews={reviews} />
        <BlogSection />
        <CTA />
        <ContactsSection />
      </main>
      <Footer />
    </>
  )
}
