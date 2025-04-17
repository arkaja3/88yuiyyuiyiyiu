'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Clock,
  Truck,
  CreditCard,
  ThumbsUp,
  Headphones,
  User,
  Map,
  Star,
  Award,
  Heart,
  Wifi,
  Coffee,
  Zap,
  Phone,
  AlertTriangle
} from 'lucide-react'

// Тип для иконки
type IconType = typeof Shield

// Доступные иконки с их названиями
const availableIcons: Record<string, IconType> = {
  Shield,
  Clock,
  Truck,
  CreditCard,
  ThumbsUp,
  Headphones,
  User,
  Map,
  Star,
  Award,
  Heart,
  Wifi,
  Coffee,
  Zap,
  Phone
}

// Тип для преимуществ
type Benefit = {
  id: number
  title: string
  description: string
  icon: string
  order: number
}

// Тип для статистики
type BenefitStats = {
  clients: string
  directions: string
  experience: string
  support: string
}

// Запасные данные на случай, если API не ответит
const fallbackBenefits = [
  {
    id: 1,
    icon: 'Shield',
    title: 'Безопасность',
    description: 'Все наши водители имеют большой опыт вождения и проходят регулярные проверки. Автомобили оснащены современными системами безопасности.',
    order: 1
  },
  {
    id: 2,
    icon: 'Clock',
    title: 'Пунктуальность',
    description: 'Мы ценим ваше время и гарантируем, что водитель прибудет вовремя. Постоянный мониторинг дорожной ситуации позволяет избегать задержек.',
    order: 2
  },
  {
    id: 3,
    icon: 'Truck',
    title: 'Комфорт',
    description: 'Современные автомобили с кондиционером, Wi-Fi и другими удобствами сделают вашу поездку максимально комфортной независимо от расстояния.',
    order: 3
  },
  {
    id: 4,
    icon: 'CreditCard',
    title: 'Удобная оплата',
    description: 'Различные способы оплаты: наличными, банковской картой или онлайн. Выберите наиболее удобный для вас вариант.',
    order: 4
  },
  {
    id: 5,
    icon: 'ThumbsUp',
    title: 'Опытные водители',
    description: 'Наши водители говорят на русском и английском языках, знают дороги и особенности пересечения границ, помогут с багажом.',
    order: 5
  },
  {
    id: 6,
    icon: 'Headphones',
    title: '24/7 поддержка',
    description: 'Служба поддержки доступна круглосуточно. Мы готовы ответить на ваши вопросы и решить любые проблемы в любое время.',
    order: 6
  }
]

const fallbackStats = {
  clients: '5000+',
  directions: '15+',
  experience: '10+',
  support: '24/7'
}

export default function BenefitsSection() {
  const [benefits, setBenefits] = useState<Benefit[]>(fallbackBenefits)
  const [stats, setStats] = useState<BenefitStats>(fallbackStats)
  const [loading, setLoading] = useState(true)

  // Загрузка данных из API
  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const response = await fetch('/api/benefits')
        
        if (!response.ok) {
          throw new Error('Не удалось загрузить данные о преимуществах')
        }
        
        const data = await response.json()
        
        if (data.benefits && data.benefits.length > 0) {
          setBenefits(data.benefits)
        }
        
        if (data.stats) {
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Ошибка при загрузке преимуществ:', error)
        // В случае ошибки используем запасные данные, уже установленные в начальном состоянии
      } finally {
        setLoading(false)
      }
    }

    fetchBenefits()
  }, [])

  // Отображение иконки по имени
  const renderIcon = (iconName: string) => {
    const IconComponent = availableIcons[iconName]
    return IconComponent ? (
      <IconComponent className="w-10 h-10" />
    ) : (
      <AlertTriangle className="w-10 h-10" />
    )
  }

  return (
    <section id="benefits" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-underline inline-block">
            Почему выбирают нас
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Мы делаем все возможное, чтобы ваше путешествие было комфортным, безопасным и приятным.
            Доверьте свою поездку профессионалам.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 card-hover"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1
              }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 text-primary bg-primary/10 p-4 rounded-full animate-float">
                  {renderIcon(benefit.icon)}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Статистика */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 bg-primary/5 p-8 rounded-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-center">
            <motion.div
              className="text-4xl md:text-5xl font-bold text-primary mb-2"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.4,
                type: 'spring',
                stiffness: 100
              }}
            >
              {stats.clients}
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300">Довольных клиентов</p>
          </div>

          <div className="text-center">
            <motion.div
              className="text-4xl md:text-5xl font-bold text-primary mb-2"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.5,
                type: 'spring',
                stiffness: 100
              }}
            >
              {stats.directions}
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300">Направлений</p>
          </div>

          <div className="text-center">
            <motion.div
              className="text-4xl md:text-5xl font-bold text-primary mb-2"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.6,
                type: 'spring',
                stiffness: 100
              }}
            >
              {stats.experience}
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300">Лет опыта</p>
          </div>

          <div className="text-center">
            <motion.div
              className="text-4xl md:text-5xl font-bold text-primary mb-2"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: 0.7,
                type: 'spring',
                stiffness: 100
              }}
            >
              {stats.support}
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300">Поддержка</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
