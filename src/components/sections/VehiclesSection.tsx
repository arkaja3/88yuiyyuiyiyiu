'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Car, Users, Briefcase, Wifi, Leaf, Coffee, Check, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, Undo2, Shield, Star } from 'lucide-react'
import BookingForm from '@/components/forms/BookingForm'

// Добавим CSS для iOS
const iosStyles = `
  .ios-vehicle-selector {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  .ios-vehicle-selector:active {
    opacity: 0.8;
  }
`;

// Тип для транспортных средств из API
type DBVehicle = {
  id: number
  class: string
  brand: string
  model: string
  year: number
  seats: number
  description: string | null
  imageUrl: string | null
  amenities: string | null
  price: number | null
  isActive: boolean
}

// Тип для отображения на фронтенде с преобразованными данными
type DisplayVehicle = {
  id: string
  name: string
  brand: string
  model: string
  year: number
  seats: number
  description: string
  price: string
  imageUrl: string | null // Изменено с image на imageUrl для соответствия с БД
  fallbackImage: string
  features: string[]
  isActive: boolean
}

// Изображения по умолчанию для разных классов транспорта
const defaultImages: Record<string, string> = {
  'Standart': 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'Comfort': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  'Business': 'https://images.unsplash.com/photo-1549399542-7e8f2e928464?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
  'VIP': 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'Minivan': 'https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
  // Значение по умолчанию для неизвестных классов
  'default': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
}

// Цены по умолчанию для разных классов транспорта
const defaultPrices: Record<string, string> = {
  'Standart': 'от 250.00 EUR',
  'Comfort': 'от 250.00 EUR',
  'Business': 'от 350.00 EUR',
  'VIP': 'от 500.00 EUR',
  'Minivan': 'от 500.00 EUR',
  // Значение по умолчанию для неизвестных классов
  'default': 'от 300.00 EUR'
}

// Основные удобства для разных классов транспорта, если не указано в БД
const defaultFeatures: Record<string, string[]> = {
  'Standart': [
    'Кондиционер',
    'Комфортабельные сиденья',
    'Wi-Fi',
    'Зарядные устройства',
    'Бутилированная вода',
    'Удобный багажник'
  ],
  'Comfort': [
    'Просторный салон',
    'Климат-контроль',
    'Wi-Fi',
    'Зарядные устройства',
    'Бутилированная вода',
    'Большой багажник'
  ],
  'Business': [
    'Кожаный салон',
    'Мультизонный климат-контроль',
    'Массаж сидений',
    'Wi-Fi',
    'Мини-бар',
    'Премиальная аудиосистема'
  ],
  'VIP': [
    'Эксклюзивный кожаный салон',
    'Интеллектуальный климат-контроль',
    'Массаж и вентиляция сидений',
    'Wi-Fi высокоскоростной',
    'Персональный мини-бар',
    'Аудиосистема премиум-класса',
    'Шумоизоляция'
  ],
  'Minivan': [
    'Просторный салон',
    'Комфортабельные сиденья',
    'Климат-контроль',
    'Wi-Fi',
    'Зарядные устройства',
    'Большое багажное отделение',
    'Складные столики'
  ]
}

// Иконки для особенностей автомобилей
const featureIcons: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi className="w-4 h-4" />,
  'Wi-Fi высокоскоростной': <Wifi className="w-4 h-4" />,
  'Просторный салон': <Users className="w-4 h-4" />,
  'Кожаный салон': <Briefcase className="w-4 h-4" />,
  'Эксклюзивный кожаный салон': <Briefcase className="w-4 h-4" />,
  'Климат-контроль': <Leaf className="w-4 h-4" />,
  'Мультизонный климат-контроль': <Leaf className="w-4 h-4" />,
  'Интеллектуальный климат-контроль': <Leaf className="w-4 h-4" />,
  'Бутилированная вода': <Coffee className="w-4 h-4" />,
  'Мини-бар': <Coffee className="w-4 h-4" />,
  'Персональный мини-бар': <Coffee className="w-4 h-4" />,
}

// Иконки для классов транспорта
const classIcons: Record<string, React.ReactNode> = {
  'Standart': <Car className="w-full h-full" />,
  'Comfort': <Car className="w-full h-full" />,
  'Business': <Briefcase className="w-full h-full" />,
  'VIP': <Star className="w-full h-full" />,
  'Minivan': <Users className="w-full h-full" />,
  'default': <Car className="w-full h-full" />
}

// Градиенты для карточек разных классов
const classGradients: Record<string, string> = {
  'Standart': 'from-blue-400 to-blue-600',
  'Comfort': 'from-emerald-400 to-emerald-600',
  'Business': 'from-violet-400 to-indigo-600',
  'VIP': 'from-amber-400 to-rose-600',
  'Minivan': 'from-teal-400 to-teal-600',
  'default': 'from-blue-400 to-blue-600'
}

export default function VehiclesSection() {
  const [vehicles, setVehicles] = useState<DisplayVehicle[]>([])
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0) // используем индекс вместо ID
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showVehicleDetails, setShowVehicleDetails] = useState(true) // По умолчанию показываем детали
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  // Добавим переменную для отслеживания состояния блокировки навигации
  const [isNavigationLocked, setIsNavigationLocked] = useState(false);

  // Добавим определение для iOS устройств
  const [isIOS, setIsIOS] = useState(true); // Всегда устанавливаем в true, чтобы отключить плавное переключение для всех устройств

  // Обновление ширины окна при изменении размера экрана и определение iOS
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Функция для конвертации данных из БД в формат для отображения
  const formatVehicleData = (dbVehicle: DBVehicle): DisplayVehicle => {
    // Получаем класс автомобиля и нормализуем его для поиска в словарях
    const vehicleClass = dbVehicle.class.trim()

    // Получаем изображение по умолчанию для данного класса или общее значение по умолчанию
    const fallbackImage = defaultImages[vehicleClass] || defaultImages.default

    // Получаем цену из базы данных или по умолчанию для данного класса
    const price = dbVehicle.price !== null
      ? `${dbVehicle.price.toFixed(2)} EUR`
      : defaultPrices[vehicleClass] || defaultPrices.default

    // Разбираем строку с удобствами из БД, если она есть
    const features = dbVehicle.amenities
      ? dbVehicle.amenities.split(';')
      : (defaultFeatures[vehicleClass] || [])

    // Формируем объект для отображения
    return {
      id: dbVehicle.id.toString(),
      name: vehicleClass,
      brand: dbVehicle.brand,
      model: dbVehicle.model,
      year: dbVehicle.year,
      seats: dbVehicle.seats,
      description: dbVehicle.description || `Комфортабельный автомобиль класса ${vehicleClass}.`,
      price: price,
      imageUrl: dbVehicle.imageUrl, // Прямое присваивание URL изображения из БД
      fallbackImage: fallbackImage,
      features: features,
      isActive: dbVehicle.isActive
    }
  }

  // Функция для загрузки транспортных средств из API
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehicles')

      if (!response.ok) {
        throw new Error('Не удалось загрузить данные об автопарке')
      }

      const data = await response.json()

      if (data.vehicles && Array.isArray(data.vehicles)) {
        // Фильтруем только активные транспортные средства и конвертируем их
        const activeVehicles = data.vehicles
          .filter((v: DBVehicle) => v.isActive)
          .map(formatVehicleData)

        if (activeVehicles.length > 0) {
          setVehicles(activeVehicles)
          setActiveVehicleIndex(0)
        } else {
          // Если нет активных транспортных средств в БД, используем демо-данные
          const demoVehicles: DBVehicle[] = [
            {
              id: 1,
              class: 'Standart',
              brand: 'Toyota',
              model: 'Camry',
              year: 2023,
              seats: 4,
              description: 'Комфортабельный автомобиль стандартного класса для городских поездок.',
              imageUrl: null,
              amenities: 'Кондиционер;Wi-Fi;Бутилированная вода;Зарядные устройства',
              price: 250,
              isActive: true
            },
            {
              id: 2,
              class: 'Comfort',
              brand: 'Skoda',
              model: 'Superb',
              year: 2023,
              seats: 4,
              description: 'Просторный автомобиль комфорт-класса с увеличенным пространством для ног.',
              imageUrl: null,
              amenities: 'Климат-контроль;Wi-Fi;Бутилированная вода;Большой багажник',
              price: 250,
              isActive: true
            },
            {
              id: 3,
              class: 'Business',
              brand: 'Mercedes-Benz',
              model: 'E-Class',
              year: 2023,
              seats: 4,
              description: 'Престижный автомобиль бизнес-класса для деловых поездок и встреч.',
              imageUrl: null,
              amenities: 'Кожаный салон;Мультизонный климат-контроль;Wi-Fi;Мини-бар',
              price: 350,
              isActive: true
            },
            {
              id: 4,
              class: 'VIP',
              brand: 'BMW',
              model: '7 Series',
              year: 2023,
              seats: 4,
              description: 'Эксклюзивный автомобиль представительского класса для особых случаев.',
              imageUrl: null,
              amenities: 'Эксклюзивный кожаный салон;Интеллектуальный климат-контроль;Wi-Fi высокоскоростной;Персональный мини-бар',
              price: 500,
              isActive: true
            },
            {
              id: 5,
              class: 'Minivan',
              brand: 'Mercedes-Benz',
              model: 'V-Class',
              year: 2023,
              seats: 7,
              description: 'Просторный минивэн для комфортной поездки большой группы до 7 человек.',
              imageUrl: null,
              amenities: 'Просторный салон;Климат-контроль;Wi-Fi;Большое багажное отделение',
              price: 500,
              isActive: true
            }
          ];

          const formattedDemoVehicles = demoVehicles.map(formatVehicleData);
          setVehicles(formattedDemoVehicles);
          setActiveVehicleIndex(0);
        }
      } else {
        // Если нет данных, отображаем сообщение
        setVehicles([])
        setError('Нет данных об автопарке')
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setError('Ошибка при загрузке данных об автопарке')
      // В случае ошибки устанавливаем пустой массив
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchVehicles()
  }, [])

  // Функция для перехода к следующему автомобилю
  const handleNextVehicle = () => {
    // Проверка блокировки, чтобы предотвратить множественные вызовы
    if (isNavigationLocked) return;

    // Блокируем навигацию
    setIsNavigationLocked(true);

    // Устанавливаем направление только если не iOS или если анимации не отключены
    if (!isIOS) {
      setDirection('right');
    }

    // Дольше время ожидания для iOS
    const transitionDelay = isIOS ? 500 : 300;

    // Более короткий таймаут для iOS - сразу меняем индекс
    if (isIOS) {
      setActiveVehicleIndex((prevIndex) => (prevIndex + 1) % vehicles.length);

      // Более длительный таймаут для разблокировки на iOS
      setTimeout(() => {
        setDirection(null);
        setIsNavigationLocked(false);
      }, 600); // Увеличиваем время разблокировки для iOS
    } else {
      // Обычное поведение для других устройств
      setTimeout(() => {
        setActiveVehicleIndex((prevIndex) => (prevIndex + 1) % vehicles.length);

        setTimeout(() => {
          setDirection(null);
          setIsNavigationLocked(false);

          // Добавляем тактильную отдачу только для не-iOS устройств
          if ('vibrate' in navigator && !isIOS) {
            navigator.vibrate(40);
          }
        }, 50);
      }, transitionDelay);
    }
  };

  // Функция для перехода к предыдущему автомобилю
  const handlePrevVehicle = () => {
    // Проверка блокировки, чтобы предотвратить множественные вызовы
    if (isNavigationLocked) return;

    // Блокируем навигацию
    setIsNavigationLocked(true);

    // Устанавливаем направление только если не iOS или если анимации не отключены
    if (!isIOS) {
      setDirection('left');
    }

    // Дольше время ожидания для iOS
    const transitionDelay = isIOS ? 500 : 300;

    // Более короткий таймаут для iOS - сразу меняем индекс
    if (isIOS) {
      setActiveVehicleIndex((prevIndex) => (prevIndex - 1 + vehicles.length) % vehicles.length);

      // Более длительный таймаут для разблокировки на iOS
      setTimeout(() => {
        setDirection(null);
        setIsNavigationLocked(false);
      }, 600); // Увеличиваем время разблокировки для iOS
    } else {
      // Обычное поведение для других устройств
      setTimeout(() => {
        setActiveVehicleIndex((prevIndex) => (prevIndex - 1 + vehicles.length) % vehicles.length);

        setTimeout(() => {
          setDirection(null);
          setIsNavigationLocked(false);

          // Добавляем тактильную отдачу только для не-iOS устройств
          if ('vibrate' in navigator && !isIOS) {
            navigator.vibrate(40);
          }
        }, 50);
      }, transitionDelay);
    }
  };

  // Функция для выбора автомобиля по индексу
  const handleVehicleSelect = (index: number) => {
    // Проверка блокировки, чтобы предотвратить множественные вызовы
    if (isNavigationLocked || index === activeVehicleIndex) return;

    // Блокируем навигацию
    setIsNavigationLocked(true);

    // Устанавливаем направление только если не iOS или если анимации не отключены
    if (!isIOS) {
      if (index > activeVehicleIndex) {
        setDirection('right');
      } else if (index < activeVehicleIndex) {
        setDirection('left');
      }
    }

    // Дольше время ожидания для iOS
    const transitionDelay = isIOS ? 500 : 300;

    // Более короткий таймаут для iOS - сразу меняем индекс
    if (isIOS) {
      setActiveVehicleIndex(index);

      // Более длительный таймаут для разблокировки на iOS
      setTimeout(() => {
        setDirection(null);
        setIsNavigationLocked(false);
      }, 600); // Увеличиваем время разблокировки для iOS
    } else {
      // Обычное поведение для других устройств
      setTimeout(() => {
        setActiveVehicleIndex(index);

        setTimeout(() => {
          setDirection(null);
          setIsNavigationLocked(false);

          // Добавляем тактильную отдачу только для не-iOS устройств
          if ('vibrate' in navigator && !isIOS) {
            navigator.vibrate(50);
          }
        }, 50);
      }, transitionDelay);
    }
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <section id="vehicles" className="py-16 md:py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-underline inline-block">
              Наш автопарк
            </h2>
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Если произошла ошибка или нет данных, показываем сообщение
  if (error || vehicles.length === 0) {
    return (
      <section id="vehicles" className="py-16 md:py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-underline inline-block">
              Наш автопарк
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {error || 'Информация об автопарке временно недоступна. Пожалуйста, свяжитесь с нами для получения актуальной информации.'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Получаем данные активного автомобиля
  const currentVehicle = vehicles[activeVehicleIndex];
  const gradient = classGradients[currentVehicle.name] || classGradients.default;

  // Изменим параметры анимации для карточки автомобиля в зависимости от платформы
  const getAnimationProps = () => {
    // Для iOS используем более простую анимацию или отключаем её
    if (isIOS) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
          duration: 0.3,
        }
      };
    }

    // Для других устройств используем полную анимацию со сдвигом
    return {
      initial: {
        opacity: 0,
        x: direction === 'left' ? -200 : direction === 'right' ? 200 : 0
      },
      animate: { opacity: 1, x: 0 },
      exit: {
        opacity: 0,
        x: direction === 'left' ? 200 : direction === 'right' ? -200 : 0
      },
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    };
  };

  return (
    <section id="vehicles" className="py-16 md:py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 heading-underline inline-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Наш автопарк
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Мы предлагаем комфортабельные автомобили разных классов для ваших поездок.
            Выберите подходящий вариант и наслаждайтесь путешествием.
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Используем условный рендеринг для полного отключения анимации на iOS */}
            {isIOS ? (
              /* Для iOS - без анимации */
              <div className="vehicle-carousel-card">
                <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
                  <div
                    className="relative rounded-xl overflow-hidden shadow-xl group"
                  >
                    <div
                      className="aspect-[16/9] bg-cover bg-center relative transition-all duration-700 transform group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${currentVehicle.imageUrl || currentVehicle.fallbackImage})`,
                        animationDuration: '3s'
                      }}
                    >
                      <div className="absolute inset-0 opacity-30 bg-gray-500"></div>
                    </div>
                    <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm shadow-lg transform hover:scale-105 transition-transform">
                      {currentVehicle.price}
                    </div>

                    {/* Стрелки навигации */}
                    <button
                      onClick={handlePrevVehicle}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
                      aria-label="Предыдущий автомобиль"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>

                    <button
                      onClick={handleNextVehicle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
                      aria-label="Следующий автомобиль"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>
                  </div>

                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white flex flex-wrap items-center gap-1">
                        <Car className="w-5 h-5 mr-1 text-primary" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
                          {currentVehicle.name}
                        </span>
                        <span className="mx-1">-</span>
                        <span>{currentVehicle.brand} {currentVehicle.model}</span>
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex items-center flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                          {currentVehicle.year} год
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {currentVehicle.seats} места
                        </span>
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 mb-6">
                        {currentVehicle.description}
                      </p>

                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-8">
                        {currentVehicle.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 group hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                          >
                            <div className="text-primary group-hover:scale-110 transition-transform">
                              {featureIcons[feature] ?? <Check className="w-4 h-4" />}
                            </div>
                            <span className="text-sm sm:text-base">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto btn-gradient relative group overflow-hidden rounded-full font-medium transition-all px-4 sm:px-6 py-3 sm:py-4 vehicle-order-button">
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                <span>Заказать трансфер</span>
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                              </span>
                              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[625px] p-0 overflow-hidden max-w-[95vw] mx-auto">
                            <BookingForm />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Для других устройств - с анимацией */
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentVehicle.id}
                  {...getAnimationProps()} // Используем функцию для определения свойств анимации
                  className="vehicle-carousel-card"
                >
                  <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
                    <motion.div
                      className="relative rounded-xl overflow-hidden shadow-xl group"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <div
                        className="aspect-[16/9] bg-cover bg-center relative transition-all duration-700 transform group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${currentVehicle.imageUrl || currentVehicle.fallbackImage})`,
                          animationDuration: '3s'
                        }}
                      >
                        <div className="absolute inset-0 opacity-30 bg-gray-500"></div>
                      </div>
                      <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm shadow-lg transform hover:scale-105 transition-transform">
                        {currentVehicle.price}
                      </div>

                      {/* Стрелки навигации */}
                      <button
                        onClick={handlePrevVehicle}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
                        aria-label="Предыдущий автомобиль"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                      </button>

                      <button
                        onClick={handleNextVehicle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
                        aria-label="Следующий автомобиль"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <div className="mb-6">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white flex flex-wrap items-center gap-1">
                          <Car className="w-5 h-5 mr-1 text-primary" />
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
                            {currentVehicle.name}
                          </span>
                          <span className="mx-1">-</span>
                          <span>{currentVehicle.brand} {currentVehicle.model}</span>
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex items-center flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                            {currentVehicle.year} год
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {currentVehicle.seats} места
                          </span>
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                          {currentVehicle.description}
                        </p>

                        <motion.div
                          className="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-8"
                          initial="hidden"
                          animate="show"
                          variants={{
                            hidden: { opacity: 0 },
                            show: {
                              opacity: 1,
                              transition: {
                                staggerChildren: 0.1
                              }
                            }
                          }}
                        >
                          {currentVehicle.features.map((feature, index) => (
                            <motion.div
                              key={index}
                              variants={{
                                hidden: { opacity: 0, x: 20 },
                                show: { opacity: 1, x: 0 }
                              }}
                              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 group hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
                            >
                              <div className="text-primary group-hover:scale-110 transition-transform">
                                {featureIcons[feature] ?? <Check className="w-4 h-4" />}
                              </div>
                              <span className="text-sm sm:text-base">{feature}</span>
                            </motion.div>
                          ))}
                        </motion.div>

                        <div className="mt-8">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="w-full sm:w-auto btn-gradient relative group overflow-hidden rounded-full font-medium transition-all px-4 sm:px-6 py-3 sm:py-4 vehicle-order-button">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                  <span>Заказать трансфер</span>
                                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[625px] p-0 overflow-hidden max-w-[95vw] mx-auto">
                              <BookingForm />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Индикаторы выбора класса транспорта */}
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 mt-8">
              {vehicles.map((vehicle, index) => {
                const isActive = index === activeVehicleIndex;
                const vehicleGradient = classGradients[vehicle.name] || classGradients.default;

                return (
                  <button
                    key={vehicle.id}
                    // Модифицируем обработчик нажатия, чтобы предотвратить двойные нажатия
                    onClick={() => {
                      if (!isNavigationLocked && index !== activeVehicleIndex) {
                        handleVehicleSelect(index);
                      }
                    }}
                    // Добавим класс для iOS устройств
                    className={`vehicle-selector-button relative px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-300 text-sm sm:text-base
                      ${isIOS ? 'ios-vehicle-selector' : ''}
                      ${isActive
                        ? `bg-gradient-to-r ${vehicleGradient} text-white shadow-md`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    aria-label={`Выбрать ${vehicle.name}`}
                    // Добавим debounce через data-атрибут
                    data-last-click={isNavigationLocked ? 'locked' : 'unlocked'}
                    disabled={isNavigationLocked} // Блокируем кнопку во время переходов
                  >
                    <span className="relative z-10 font-medium">{vehicle.name}</span>
                    {isActive && !isIOS && (
                      <motion.span
                        layoutId="activeIndicator"
                        className="absolute inset-0 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {isActive && isIOS && (
                      <span className="absolute inset-0 rounded-lg"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
