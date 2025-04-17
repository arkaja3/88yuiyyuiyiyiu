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
  Car,
  Trash2,
  PlusCircle,
  Edit,
  Users,
  Calendar,
  FileText,
  List,
  Check,
  Wifi
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

// Тип для транспортных средств
type Vehicle = {
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
  createdAt: string
  updatedAt: string
}

export default function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null)
  const [amenitiesList, setAmenitiesList] = useState<string[]>([])
  const [formData, setFormData] = useState({
    class: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    seats: 4,
    description: '',
    imageUrl: '',
    amenities: '',
    price: null as number | null,
    isActive: true
  })

  // Загрузка данных
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vehicles')
      const data = await response.json()

      if (data.vehicles) {
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Не удалось загрузить данные о транспортных средствах')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // Обработчик изменения формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения для чекбокса
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }))
  }

  // Обработчик добавления удобства
  const handleAddAmenity = () => {
    const amenity = prompt('Введите новое удобство')
    if (amenity && amenity.trim() !== '') {
      const newAmenities = [...amenitiesList, amenity.trim()]
      setAmenitiesList(newAmenities)
      setFormData(prev => ({ ...prev, amenities: newAmenities.join(';') }))
    }
  }

  // Обработчик удаления удобства
  const handleRemoveAmenity = (index: number) => {
    const newAmenities = [...amenitiesList]
    newAmenities.splice(index, 1)
    setAmenitiesList(newAmenities)
    setFormData(prev => ({ ...prev, amenities: newAmenities.join(';') }))
  }

  // Создание или обновление транспортного средства
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.class.trim() || !formData.brand.trim() || !formData.model.trim()) {
      toast.error('Пожалуйста, заполните все обязательные поля')
      return
    }

    try {
      let response

      if (currentVehicle) {
        // Обновление существующего транспортного средства
        response = await fetch('/api/vehicles', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: currentVehicle.id,
            class: formData.class,
            brand: formData.brand,
            model: formData.model,
            year: formData.year,
            seats: formData.seats,
            description: formData.description,
            imageUrl: formData.imageUrl,
            amenities: formData.amenities,
            price: formData.price,
            isActive: formData.isActive
          })
        })
      } else {
        // Создание нового транспортного средства
        response = await fetch('/api/vehicles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            class: formData.class,
            brand: formData.brand,
            model: formData.model,
            year: formData.year,
            seats: formData.seats,
            description: formData.description,
            imageUrl: formData.imageUrl,
            amenities: formData.amenities,
            price: formData.price,
            isActive: formData.isActive
          })
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Что-то пошло не так')
      }

      toast.success(currentVehicle ? 'Транспортное средство обновлено' : 'Транспортное средство добавлено')
      setIsModalOpen(false)
      resetForm()
      fetchVehicles()
    } catch (error) {
      console.error('Error saving vehicle:', error)
      toast.error(
        currentVehicle
          ? 'Не удалось обновить транспортное средство'
          : 'Не удалось добавить транспортное средство'
      )
    }
  }

  // Удаление транспортного средства
  const deleteVehicle = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это транспортное средство?')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/vehicles?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Не удалось удалить транспортное средство')
      }

      toast.success('Транспортное средство удалено')
      fetchVehicles()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Не удалось удалить транспортное средство')
    } finally {
      setIsDeleting(false)
    }
  }

  // Редактирование транспортного средства
  const editVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle)
    setFormData({
      class: vehicle.class,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      seats: vehicle.seats,
      description: vehicle.description || '',
      imageUrl: vehicle.imageUrl || '',
      amenities: vehicle.amenities || '',
      price: vehicle.price,
      isActive: vehicle.isActive
    })

    // Разбиваем строку с удобствами на массив
    if (vehicle.amenities) {
      setAmenitiesList(vehicle.amenities.split(';'))
    } else {
      setAmenitiesList([])
    }

    setIsModalOpen(true)
  }

  // Сброс формы
  const resetForm = () => {
    setFormData({
      class: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      seats: 4,
      description: '',
      imageUrl: '',
      amenities: '',
      price: null,
      isActive: true
    })
    setAmenitiesList([])
    setCurrentVehicle(null)
  }

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Управление автопарком</h2>
        <Button onClick={() => {
          resetForm()
          setIsModalOpen(true)
        }}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Добавить транспортное средство
        </Button>
      </div>

      {vehicles.length === 0 && !loading ? (
        <p className="text-center text-gray-500 py-8">Нет добавленных транспортных средств</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className={`overflow-hidden ${!vehicle.isActive ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                      <Car className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{vehicle.class} - {vehicle.brand} {vehicle.model}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editVehicle(vehicle)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteVehicle(vehicle.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {vehicle.year} год
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs">
                    <Users className="w-3 h-3 mr-1" />
                    {vehicle.seats} мест
                  </span>
                  {vehicle.price !== null && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-xs text-green-800">
                      {vehicle.price} EUR
                    </span>
                  )}
                  {!vehicle.isActive && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-xs text-red-800">
                      Неактивно
                    </span>
                  )}
                </div>

                {vehicle.description && (
                  <p className="text-sm text-gray-600 mb-2">{vehicle.description}</p>
                )}

                {vehicle.imageUrl && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Изображение:</p>
                    <div className="relative rounded-lg overflow-hidden h-32 bg-gray-100">
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://placehold.co/600x400?text=No+Image';
                        }}
                      />
                    </div>
                  </div>
                )}

                {vehicle.amenities && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Удобства:</p>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.amenities.split(';').map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-xs"
                        >
                          <Check className="w-3 h-3 mr-1 text-green-500" />
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Модальное окно добавления/редактирования транспортного средства */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentVehicle ? 'Редактировать транспортное средство' : 'Добавить транспортное средство'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Класс транспорта *</label>
                <Input
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  placeholder="Например: Standart, Comfort, Business, VIP"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Марка *</label>
                <Input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Например: Mercedes-Benz, BMW"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Модель *</label>
                <Input
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Например: E class, 5 Series"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Год выпуска *</label>
                <Input
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  min={2000}
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Количество мест *</label>
                <Input
                  name="seats"
                  type="number"
                  value={formData.seats}
                  onChange={handleChange}
                  min={1}
                  max={50}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Цена (EUR)</label>
                <Input
                  name="price"
                  type="number"
                  value={formData.price === null ? '' : formData.price}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseFloat(e.target.value);
                    setFormData(prev => ({ ...prev, price: value }));
                  }}
                  placeholder="Например: 250.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">URL изображения</label>
              <Input
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Описание транспортного средства..."
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Удобства</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAmenity}
                >
                  Добавить удобство
                </Button>
              </div>

              {amenitiesList.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                  {amenitiesList.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"
                    >
                      <span className="text-sm">{amenity}</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 ml-1"
                        onClick={() => handleRemoveAmenity(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 p-3 border rounded-md">
                  Нет добавленных удобств. Нажмите "Добавить удобство" для добавления.
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.isActive}
                onCheckedChange={handleCheckboxChange}
                id="isActive"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Активное транспортное средство
              </label>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false)
                  resetForm()
                }}
              >
                Отмена
              </Button>
              <Button type="submit">
                {currentVehicle ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
