'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Checkbox,
  CheckboxIndicator
} from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  MapPin,
  Trash2,
  PlusCircle,
  Edit,
  Router,
  Clock,
  Image,
  DollarSign
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Тип для маршрутов
type Route = {
  id: number
  originCity: string
  destinationCity: string
  distance: number
  estimatedTime: string
  priceComfort: number
  priceBusiness: number
  priceMinivan: number
  description: string | null
  imageUrl: string | null
  popularityRating: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function RoutesList() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [formData, setFormData] = useState({
    originCity: '',
    destinationCity: '',
    distance: 0,
    estimatedTime: '',
    priceComfort: 0,
    priceBusiness: 0,
    priceMinivan: 0,
    description: '',
    imageUrl: '',
    popularityRating: 1,
    isActive: true
  })

  // Загрузка данных
  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/routes')
      const data = await response.json()

      if (data.routes) {
        setRoutes(data.routes)
      }
    } catch (error) {
      console.error('Error fetching routes:', error)
      toast.error('Не удалось загрузить данные о маршрутах')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  // Обработчик изменения формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Преобразуем числовые поля
    if (['distance', 'priceComfort', 'priceBusiness', 'priceMinivan', 'popularityRating'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Обработчик изменения для чекбокса
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }))
  }

  // Создание или обновление маршрута
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.originCity.trim() || !formData.destinationCity.trim()) {
      toast.error('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      let response

      if (currentRoute) {
        // Обновление существующего маршрута
        response = await fetch('/api/routes', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: currentRoute.id,
            originCity: formData.originCity,
            destinationCity: formData.destinationCity,
            distance: formData.distance,
            estimatedTime: formData.estimatedTime,
            priceComfort: formData.priceComfort,
            priceBusiness: formData.priceBusiness,
            priceMinivan: formData.priceMinivan,
            description: formData.description,
            imageUrl: formData.imageUrl,
            popularityRating: formData.popularityRating,
            isActive: formData.isActive
          })
        })
      } else {
        // Создание нового маршрута
        response = await fetch('/api/routes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            originCity: formData.originCity,
            destinationCity: formData.destinationCity,
            distance: formData.distance,
            estimatedTime: formData.estimatedTime,
            priceComfort: formData.priceComfort,
            priceBusiness: formData.priceBusiness,
            priceMinivan: formData.priceMinivan,
            description: formData.description,
            imageUrl: formData.imageUrl,
            popularityRating: formData.popularityRating,
            isActive: formData.isActive
          })
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Что-то пошло не так')
      }

      toast.success(currentRoute ? 'Маршрут обновлен' : 'Маршрут добавлен')
      setIsModalOpen(false)
      resetForm()
      fetchRoutes()
    } catch (error) {
      console.error('Error saving route:', error)
      toast.error(
        currentRoute
          ? 'Не удалось обновить маршрут'
          : 'Не удалось добавить маршрут'
      )
    }
  }

  // Удаление маршрута
  const deleteRoute = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот маршрут?')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/routes?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Не удалось удалить маршрут')
      }

      toast.success('Маршрут успешно удален')
      fetchRoutes()
    } catch (error) {
      console.error('Error deleting route:', error)
      toast.error('Не удалось удалить маршрут')
    } finally {
      setIsDeleting(false)
    }
  }

  // Открытие формы для редактирования
  const openEditForm = (route: Route) => {
    setCurrentRoute(route)
    setFormData({
      originCity: route.originCity,
      destinationCity: route.destinationCity,
      distance: route.distance,
      estimatedTime: route.estimatedTime,
      priceComfort: route.priceComfort,
      priceBusiness: route.priceBusiness,
      priceMinivan: route.priceMinivan,
      description: route.description || '',
      imageUrl: route.imageUrl || '',
      popularityRating: route.popularityRating,
      isActive: route.isActive
    })
    setIsModalOpen(true)
  }

  // Открытие формы для создания нового маршрута
  const openCreateForm = () => {
    setCurrentRoute(null)
    resetForm()
    setIsModalOpen(true)
  }

  // Сброс формы
  const resetForm = () => {
    setFormData({
      originCity: '',
      destinationCity: '',
      distance: 0,
      estimatedTime: '',
      priceComfort: 0,
      priceBusiness: 0,
      priceMinivan: 0,
      description: '',
      imageUrl: '',
      popularityRating: 1,
      isActive: true
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление маршрутами</h2>
        <Button
          onClick={openCreateForm}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Добавить маршрут
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {routes.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                <p>Маршруты не найдены. Создайте ваш первый маршрут.</p>
              </CardContent>
            </Card>
          ) : (
            routes.map((route) => (
              <Card key={route.id} className={`overflow-hidden ${!route.isActive ? 'opacity-70' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold flex items-center">
                            <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                            {route.originCity} — {route.destinationCity}
                          </h3>
                          <p className="text-gray-600 text-sm">ID: {route.id}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(route)}
                            className="h-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteRoute(route.id)}
                            disabled={isDeleting}
                            className="h-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4">
                        <div className="flex items-center text-sm">
                          <Router className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-600">Расстояние:</span>
                          <span className="ml-2 font-medium">{route.distance} км</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-gray-600">Время в пути:</span>
                          <span className="ml-2 font-medium">{route.estimatedTime}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-gray-600">Comfort:</span>
                          <span className="ml-2 font-medium">{route.priceComfort} €</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-gray-600">Business:</span>
                          <span className="ml-2 font-medium">{route.priceBusiness} €</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="text-gray-600">Minivan:</span>
                          <span className="ml-2 font-medium">{route.priceMinivan} €</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-2 mb-4">
                        {route.description || "Описание отсутствует"}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {route.imageUrl && (
                          <div className="flex items-center text-sm text-blue-600">
                            <Image className="h-4 w-4 mr-1" />
                            <span>Есть изображение</span>
                          </div>
                        )}
                        {!route.isActive && (
                          <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            Не активен
                          </div>
                        )}
                      </div>
                    </div>
                    {route.imageUrl && (
                      <div className="md:w-1/4 w-full">
                        <img
                          src={route.imageUrl}
                          alt={`${route.originCity} - ${route.destinationCity}`}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentRoute ? `Редактирование маршрута: ${currentRoute.originCity} - ${currentRoute.destinationCity}` : 'Новый маршрут'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Город отправления *</label>
                <Input
                  name="originCity"
                  value={formData.originCity}
                  onChange={handleChange}
                  placeholder="Калининград"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Город назначения *</label>
                <Input
                  name="destinationCity"
                  value={formData.destinationCity}
                  onChange={handleChange}
                  placeholder="Гданьск"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Расстояние (км) *</label>
                <Input
                  name="distance"
                  type="number"
                  min="0"
                  value={formData.distance}
                  onChange={handleChange}
                  placeholder="150"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Время в пути *</label>
                <Input
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleChange}
                  placeholder="2-3 часа"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Цена Comfort (€) *</label>
                <Input
                  name="priceComfort"
                  type="number"
                  min="0"
                  value={formData.priceComfort}
                  onChange={handleChange}
                  placeholder="250"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Цена Business (€) *</label>
                <Input
                  name="priceBusiness"
                  type="number"
                  min="0"
                  value={formData.priceBusiness}
                  onChange={handleChange}
                  placeholder="350"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Цена Minivan (€) *</label>
                <Input
                  name="priceMinivan"
                  type="number"
                  min="0"
                  value={formData.priceMinivan}
                  onChange={handleChange}
                  placeholder="450"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Описание</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Краткое описание маршрута"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL изображения</label>
              <Input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500">Ссылка на изображение маршрута</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Рейтинг популярности (1-5)</label>
                <Input
                  name="popularityRating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.popularityRating}
                  onChange={handleChange}
                  placeholder="5"
                />
              </div>
              <div className="flex items-center h-full pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={handleCheckboxChange}
                  >
                    <CheckboxIndicator />
                  </Checkbox>
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Маршрут активен
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">
                {currentRoute ? 'Сохранить изменения' : 'Создать маршрут'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
