'use client' 

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, MapPin } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BookingForm from '@/components/forms/BookingForm'

// Определяем тип для маршрута из API
interface Route {
  id: number;
  originCity: string;
  destinationCity: string;
  distance: number;
  estimatedTime: string;
  priceComfort: number;
  priceBusiness: number;
  priceMinivan: number;
  description: string | null;
  imageUrl: string | null;
  popularityRating: number;
  isActive: boolean;
}

// Названия классов автомобилей для отображения
const vehicleClassLabels: Record<string, string> = {
  standard: 'Standart',
  comfort: 'Comfort',
  business: 'Business',
  premium: 'VIP',
  minivan: 'Minivan'
}

// Фоновое изображение по умолчанию, если imageUrl не указан
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1600623471616-8c1966c91ff6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'

export default function RoutesSection() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('comfort')
  const [error, setError] = useState<string | null>(null)

  // Загрузка данных о маршрутах из API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Fetching routes from API...')
        const response = await fetch('/api/routes', {
          // Добавляем параметр для предотвращения кеширования
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          }
        })

        const data = await response.json()
        console.log('Routes data received:', data)

        if (data.routes) {
          // Фильтруем только активные маршруты
          const activeRoutes = data.routes.filter((route: Route) => route.isActive)
          // Сортируем по рейтингу популярности (от высокого к низкому)
          const sortedRoutes = activeRoutes.sort((a: Route, b: Route) => b.popularityRating - a.popularityRating)

          console.log('Processed routes:', sortedRoutes)
          console.log('Route images:')
          sortedRoutes.forEach((route: Route) => {
            console.log(`Route ${route.id} (${route.originCity}-${route.destinationCity}): imageUrl = ${route.imageUrl || 'Not set'}`)
          })

          setRoutes(sortedRoutes)
        }
      } catch (error) {
        console.error('Error fetching routes:', error)
        setError('Не удалось загрузить маршруты')
      } finally {
        setLoading(false)
      }
    }

    fetchRoutes()
    // Убираем интервал обновления, который вызывает постоянную перезагрузку
  }, [])

  // Функция для получения цены в зависимости от класса автомобиля
  const getPriceByClass = (route: Route, vehicleClass: string) => {
    switch (vehicleClass) {
      case 'comfort':
        return route.priceComfort
      case 'business':
        return route.priceBusiness
      case 'minivan':
        return route.priceMinivan
      // Для несуществующих классов возвращаем цену комфорт-класса
      default:
        return route.priceComfort
    }
  }

  // Функция для обработки URL изображения
  const getImageUrl = (route: Route) => {
    if (!route.imageUrl) return DEFAULT_IMAGE

    // Если URL начинается с http:// или https://, используем его напрямую
    if (route.imageUrl.startsWith('http://') || route.imageUrl.startsWith('https://')) {
      return route.imageUrl
    }

    // Иначе считаем, что это локальный путь и добавляем базовый URL
    return route.imageUrl
  }

  return (
    <section id="routes" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 heading-underline inline-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Наши популярные маршруты
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Выбирайте направление и наслаждайтесь комфортной поездкой. Мы предлагаем трансферы
            по наиболее востребованным маршрутам из Калининграда в города Европы.
          </motion.p>
        </div>

        {error && (
          <div className="text-red-500 text-center mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>Маршруты временно недоступны. Пожалуйста, проверьте позже.</p>
              </div>
            ) : (
              routes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex"
                >
                  <Card className="overflow-hidden w-full flex flex-col card-hover">
                    <div
                      className="h-48 bg-cover bg-center relative flex-shrink-0"
                      style={{
                        backgroundImage: `url(${getImageUrl(route)})`,
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                        <div className="text-white w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-5 h-5 text-primary" />
                              <h3 className="text-xl font-bold">{route.destinationCity}</h3>
                            </div>
                            <div className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm">
                              {route.estimatedTime}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5 flex flex-col flex-grow">
                      {/* Задаем блоку с описанием фиксированную высоту и vertical scrolling при необходимости */}
                      <div className="mb-4 h-[80px] overflow-y-auto">
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{route.description}</p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Расстояние:</span>
                          <span className="ml-2">{route.distance} км</span>
                        </div>
                      </div>

                      <div className="border-t pt-4 mt-auto">
                        <div className="mb-4">
                          <p className="text-sm font-medium text-center">Выберите класс автомобиля</p>
                        </div>

                        <Tabs defaultValue="comfort" onValueChange={(value) => setActiveTab(value)} className="w-full">
                          <div className="flex flex-col gap-2">
                            <TabsList className="grid grid-cols-3 w-full h-auto">
                              <TabsTrigger value="standard" className="text-xs h-auto py-1.5">Standart</TabsTrigger>
                              <TabsTrigger value="comfort" className="text-xs h-auto py-1.5">Comfort</TabsTrigger>
                              <TabsTrigger value="business" className="text-xs h-auto py-1.5">Business</TabsTrigger>
                            </TabsList>

                            <TabsList className="grid grid-cols-2 w-full h-auto">
                              <TabsTrigger value="premium" className="text-xs h-auto py-1.5">VIP</TabsTrigger>
                              <TabsTrigger value="minivan" className="text-xs h-auto py-1.5">Minivan</TabsTrigger>
                            </TabsList>
                          </div>

                          {/* Установим фиксированную высоту для блока контента табов */}
                          <div className="h-[90px]">
                            {/* Контент для всех типов автомобилей */}
                            {Object.keys(vehicleClassLabels).map((vehicleClass) => (
                              <TabsContent key={vehicleClass} value={vehicleClass} className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{vehicleClassLabels[vehicleClass]}</p>
                                    <p className="font-bold text-primary text-lg">
                                      от {getPriceByClass(route, vehicleClass)} EUR
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>
                            ))}
                          </div>
                        </Tabs>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full btn-gradient gap-1 items-center mt-4">
                              Заказать трансфер
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[625px] p-0 overflow-hidden">
                            <BookingForm />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  )
}
