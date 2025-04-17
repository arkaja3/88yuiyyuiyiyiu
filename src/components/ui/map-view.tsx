'use client'

// Объявление типов для Google Maps API в глобальном пространстве
declare global {
  interface Window {
    google?: any;
    initGoogleMaps?: () => void;
  }
}

import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Maximize2, Minimize2, Map } from 'lucide-react'

interface MapViewProps {
  originCity: string
  destinationCity: string
  customOriginCity?: string
  customDestinationCity?: string
  originAddress?: string
  destinationAddress?: string
  tellDriver?: boolean
  isVisible: boolean
}

interface RouteDetails {
  distance: string
  duration: string
}

// Карта городов с координатами
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  kaliningrad: { lat: 54.7104, lng: 20.5101 },
  gdansk: { lat: 54.3520, lng: 18.6466 },
  warsaw: { lat: 52.2297, lng: 21.0122 },
  berlin: { lat: 52.5200, lng: 13.4050 },
  vilnius: { lat: 54.6872, lng: 25.2797 },
  kaunas: { lat: 54.8985, lng: 23.9036 },
  riga: { lat: 56.9496, lng: 24.1052 }
}

export function MapView({
  originCity,
  destinationCity,
  customOriginCity,
  customDestinationCity,
  originAddress,
  destinationAddress,
  tellDriver = false,
  isVisible
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [route, setRoute] = useState<RouteDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  // Храним ссылки на маркеры и renderer для очистки
  const markersRef = useRef<any[]>([])
  const rendererRef = useRef<any>(null)

  // Функция для очистки маркеров и маршрутов
  const clearMap = () => {
    // Удаляем все существующие маркеры
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
    }

    // Очищаем маршрут
    if (rendererRef.current) {
      rendererRef.current.setMap(null)
      rendererRef.current = null
    }
  }

  // Функция для получения координат города
  const getCityCoordinates = async (city: string, customCityName?: string, address?: string) => {
    // Если указан адрес и это стандартный город или пользовательский город
    if (address && window.google) {
      try {
        const geocoder = new window.google.maps.Geocoder()
        let fullAddress = ''

        if (city === 'custom' && customCityName) {
          fullAddress = `${customCityName}, ${address}`
        } else if (city !== 'custom') {
          fullAddress = `${cities.find(c => c.value === city)?.label || city}, ${address}`
        }

        const response = await new Promise<any[]>((resolve, reject) => {
          geocoder.geocode({ address: fullAddress }, (results: any, status: any) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results)
            } else {
              // Если геокодирование не удалось, используем координаты города
              resolve([])
            }
          })
        })

        if (response.length > 0) {
          const location = response[0].geometry.location
          return { lat: location.lat(), lng: location.lng() }
        }
      } catch (err) {
        console.error('Error geocoding address:', err)
      }
    }

    // Используем координаты города по умолчанию, если это предопределенный город
    if (city !== 'custom' && cityCoordinates[city]) {
      return cityCoordinates[city]
    }

    // Если это пользовательский город без адреса, геокодируем город
    if (city === 'custom' && customCityName && window.google) {
      try {
        const geocoder = new window.google.maps.Geocoder()

        const response = await new Promise<any[]>((resolve, reject) => {
          geocoder.geocode({ address: customCityName }, (results: any, status: any) => {
            if (status === 'OK' && results && results.length > 0) {
              resolve(results)
            } else {
              reject(new Error(`Geocoding failed: ${status}`))
            }
          })
        })

        if (response.length > 0) {
          const location = response[0].geometry.location
          return { lat: location.lat(), lng: location.lng() }
        }
      } catch (err) {
        console.error('Error geocoding custom city:', err)
        setError(`Не удалось найти местоположение для города: ${customCityName}`)
      }
    }

    return null
  }

  // Инициализация карты
  useEffect(() => {
    if (!isVisible || !window.google) return

    const initMap = () => {
      if (!mapRef.current) return
      setIsLoading(true)
      setError(null)

      try {
        // Начинаем с центра на Калининграде по умолчанию
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: cityCoordinates.kaliningrad,
          zoom: 5,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false
        })

        setMap(newMap)
        setIsLoading(false)
      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Не удалось загрузить карту')
        setIsLoading(false)
      }
    }

    initMap()

    return () => {
      clearMap()
    }
  }, [isVisible])

  // Обновление маршрута при изменении городов
  useEffect(() => {
    if (!map || !isVisible || !originCity || !destinationCity || !window.google) return

    const getRouteDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Очищаем карту перед добавлением новых маркеров и маршрутов
        clearMap()

        // Получаем координаты городов отправления и назначения с учетом адресов
        const originCoords = await getCityCoordinates(originCity, customOriginCity, originAddress)

        // Для пункта назначения учитываем флаг "Скажу водителю"
        const destCoords = !tellDriver
          ? await getCityCoordinates(destinationCity, customDestinationCity, destinationAddress)
          : await getCityCoordinates(destinationCity, customDestinationCity)

        if (!originCoords || !destCoords) {
          throw new Error('Не удалось получить координаты одного из городов')
        }

        // Устанавливаем маркеры
        const originTitle = originCity === 'custom'
          ? customOriginCity
          : cities.find(c => c.value === originCity)?.label

        const destinationTitle = destinationCity === 'custom'
          ? customDestinationCity
          : cities.find(c => c.value === destinationCity)?.label

        // Создаем и сохраняем ссылки на маркеры
        const originMarker = new window.google.maps.Marker({
          position: originCoords,
          map: map,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
          },
          title: originTitle,
          animation: window.google.maps.Animation.DROP
        })

        const destMarker = new window.google.maps.Marker({
          position: destCoords,
          map: map,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          },
          title: destinationTitle,
          animation: window.google.maps.Animation.DROP
        })

        // Добавляем маркеры в ref для последующей очистки
        markersRef.current.push(originMarker, destMarker)

        // Создаем сервис для построения маршрута
        const directionsService = new window.google.maps.DirectionsService()
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: true, // Отключаем стандартные маркеры
          polylineOptions: {
            strokeColor: '#0066ff',
            strokeOpacity: 0.8,
            strokeWeight: 5
          }
        })

        // Сохраняем renderer для последующей очистки
        rendererRef.current = directionsRenderer

        // Запрос маршрута
        const response = await new Promise<any>((resolve, reject) => {
          directionsService.route({
            origin: originCoords,
            destination: destCoords,
            travelMode: window.google.maps.TravelMode.DRIVING
          }, (result: any, status: any) => {
            if (status === 'OK' && result) {
              resolve(result)
            } else {
              reject(new Error(`Directions request failed: ${status}`))
            }
          })
        })

        // Отображаем маршрут
        directionsRenderer.setDirections(response)

        // Получаем информацию о маршруте
        const route = response.routes[0]
        if (route && route.legs[0]) {
          setRoute({
            distance: route.legs[0].distance?.text || 'Не определено',
            duration: route.legs[0].duration?.text || 'Не определено'
          })
        }

        // Настраиваем границы карты, чтобы маршрут помещался
        const bounds = new window.google.maps.LatLngBounds()
        bounds.extend(originCoords)
        bounds.extend(destCoords)
        map.fitBounds(bounds)

        setIsLoading(false)
      } catch (err) {
        console.error('Error calculating route:', err)
        setError('Не удалось построить маршрут')
        setIsLoading(false)
      }
    }

    if (originCity && destinationCity) {
      getRouteDetails()
    }
  }, [map, isVisible, originCity, destinationCity, customOriginCity, customDestinationCity, originAddress, destinationAddress, tellDriver])

  // Обработчик для переключения режима отображения карты
  const toggleMapSize = () => {
    setIsExpanded(!isExpanded)
  }

  // Если не выбраны оба города, не показываем карту
  if (!isVisible || !originCity || !destinationCity) {
    return null
  }

  // Определяем города отправления и прибытия для отображения
  const originCityName = originCity === 'custom'
    ? customOriginCity
    : cities.find(c => c.value === originCity)?.label

  const destinationCityName = destinationCity === 'custom'
    ? customDestinationCity
    : cities.find(c => c.value === destinationCity)?.label

  return (
    <Card className={`mb-8 overflow-hidden transition-all rounded-lg shadow-md ${isExpanded ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      <div className="relative">
        {/* Заголовок карты с информацией о маршруте */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 flex justify-between items-center border-b">
          <div className="flex items-center">
            <Map className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">
              {originCityName} → {destinationCityName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8"
            onClick={toggleMapSize}
            title={isExpanded ? "Свернуть карту" : "Развернуть карту"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10 p-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div
          ref={mapRef}
          className={`w-full ${isExpanded ? 'h-[calc(100vh-120px)]' : 'h-60'} transition-all duration-300`}
        ></div>

        {route && (
          <div className="bg-white p-3 border-t">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-gray-500 text-sm mr-1">Расстояние:</span>
                <span className="font-medium text-sm">{route.distance}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 text-sm mr-1">Время в пути:</span>
                <span className="font-medium text-sm">{route.duration}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// Список доступных городов для выбора (копия из BookingForm.tsx)
const cities = [
  { value: 'kaliningrad', label: 'Калининград' },
  { value: 'gdansk', label: 'Гданьск' },
  { value: 'warsaw', label: 'Варшава' },
  { value: 'berlin', label: 'Берлин' },
  { value: 'vilnius', label: 'Вильнюс' },
  { value: 'kaunas', label: 'Каунас' },
  { value: 'riga', label: 'Рига' },
  { value: 'custom', label: 'Другой город...' }
]
