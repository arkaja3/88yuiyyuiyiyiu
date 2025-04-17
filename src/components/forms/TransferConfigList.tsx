'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import {
  Checkbox,
  CheckboxIndicator
} from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  Car,
  Trash2,
  PlusCircle,
  Edit,
  ImageIcon,
  Check,
  Settings,
  RefreshCw,
  Database,
  FileJson
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Vehicle = {
  id?: number
  vehicleId?: number
  value: string
  label: string
  price: string
  image?: string
  desc: string
}

type TransferConfig = {
  id: number
  title: string
  description: string
  vehicleOptions?: string
  customImageUrls?: string
  useVehiclesFromDb: boolean
  updatedAt: string
  vehicles?: Vehicle[]
}

// Компонент карточки автомобиля
const VehicleCard = ({
  vehicle,
  onEdit,
  onImageEdit,
  customImages = {}
}: {
  vehicle: Vehicle,
  onEdit: (vehicle: Vehicle) => void,
  onImageEdit: (vehicleValue: string) => void,
  customImages?: Record<string, string>
}) => {
  // Определить, какое изображение показывать
  // (кастомное из настроек или из базы данных)
  const imageUrl = customImages[vehicle.value] || vehicle.image;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">{vehicle.label}</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onImageEdit(vehicle.value)}
              title="Изменить изображение"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            {!vehicle.vehicleId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(vehicle)}
                title="Редактировать автомобиль"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs">
            {vehicle.price}
          </span>
          {vehicle.vehicleId && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-xs ml-2">
              <Database className="w-3 h-3 mr-1" />
              Из базы данных
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-2">{vehicle.desc}</p>

        <div className="mb-2">
          <div className="relative rounded-lg overflow-hidden h-32 bg-gray-100">
            <img
              src={imageUrl || 'https://placehold.co/600x400?text=No+Image'}
              alt={vehicle.label}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/600x400?text=No+Image';
              }}
            />
            {customImages[vehicle.value] && (
              <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                Своё изображение
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function TransferConfigList() {
  const [transferConfig, setTransferConfig] = useState<TransferConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isConfigEditDialogOpen, setIsConfigEditDialogOpen] = useState(false)
  const [isVehicleEditDialogOpen, setIsVehicleEditDialogOpen] = useState(false)
  const [isImageEditDialogOpen, setIsImageEditDialogOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | null>(null)
  const [currentVehicleValue, setCurrentVehicleValue] = useState<string>('')
  const [customImages, setCustomImages] = useState<Record<string, string>>({})

  // Форма редактирования настроек
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    useVehiclesFromDb: true,
  })

  // Форма редактирования автомобиля
  const [vehicleFormData, setVehicleFormData] = useState<Vehicle>({
    value: '',
    label: '',
    price: '',
    image: '',
    desc: ''
  })

  // Форма редактирования изображения
  const [imageFormData, setImageFormData] = useState({
    imageUrl: ''
  })

  // Загрузка настроек
  const fetchTransferConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transfers')
      const data = await response.json()

      if (data.config) {
        setTransferConfig(data.config)
        setFormData({
          title: data.config.title || '',
          description: data.config.description || '',
          useVehiclesFromDb: data.config.useVehiclesFromDb
        })

        // Если есть кастомные изображения, парсим их
        if (data.config.customImageUrls) {
          try {
            const parsedImages = JSON.parse(data.config.customImageUrls)
            setCustomImages(parsedImages)
          } catch (error) {
            console.error('Error parsing customImageUrls:', error)
            setCustomImages({})
          }
        } else {
          setCustomImages({})
        }
      }
    } catch (error) {
      console.error('Error fetching transfer config:', error)
      toast.error('Не удалось загрузить настройки модального окна трансфера')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransferConfig()
  }, [])

  // Обработчик изменения формы редактирования настроек
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения чекбокса
  const handleConfigCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, useVehiclesFromDb: checked }))
  }

  // Обработчик изменения формы редактирования автомобиля
  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVehicleFormData(prev => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения формы редактирования изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setImageFormData(prev => ({ ...prev, [name]: value }))
  }

  // Сохранение настроек
  const saveTransferConfig = async () => {
    if (!transferConfig) return

    try {
      setSaving(true)

      // Если у нас включен режим "из базы данных", используем только базовые настройки
      const payload: any = {
        title: formData.title,
        description: formData.description,
        useVehiclesFromDb: formData.useVehiclesFromDb
      }

      // Если не используем автомобили из БД, то добавляем список автомобилей
      if (!formData.useVehiclesFromDb && transferConfig.vehicles) {
        payload.vehicleOptions = transferConfig.vehicles
      }

      // Всегда добавляем кастомные изображения, даже если используем авто из БД
      if (Object.keys(customImages).length > 0) {
        payload.customImageUrls = customImages
      }

      const response = await fetch('/api/transfers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Что-то пошло не так')
      }

      toast.success('Настройки модального окна трансфера сохранены')
      setIsConfigEditDialogOpen(false)
      fetchTransferConfig()
    } catch (error) {
      console.error('Error saving transfer config:', error)
      toast.error('Не удалось сохранить настройки')
    } finally {
      setSaving(false)
    }
  }

  // Редактирование автомобиля
  const editVehicle = (vehicle: Vehicle) => {
    setCurrentVehicle(vehicle)
    setVehicleFormData({
      value: vehicle.value,
      label: vehicle.label,
      price: vehicle.price,
      image: vehicle.image || '',
      desc: vehicle.desc
    })
    setIsVehicleEditDialogOpen(true)
  }

  // Сохранение изменений автомобиля
  const saveVehicle = () => {
    if (!transferConfig || !transferConfig.vehicles) return

    // Валидация
    if (!vehicleFormData.label || !vehicleFormData.price || !vehicleFormData.value) {
      toast.error('Пожалуйста, заполните все обязательные поля')
      return
    }

    // Находим индекс текущего автомобиля
    const index = transferConfig.vehicles.findIndex(v =>
      currentVehicle ? v.value === currentVehicle.value : false
    )

    // Создаем обновленный список автомобилей
    const updatedVehicles = [...transferConfig.vehicles]

    if (index !== -1) {
      // Обновляем существующий автомобиль
      updatedVehicles[index] = vehicleFormData
    }

    // Обновляем конфигурацию
    setTransferConfig({
      ...transferConfig,
      vehicles: updatedVehicles
    })

    // Сохраняем изменения
    setIsVehicleEditDialogOpen(false)
    toast.success('Автомобиль обновлен. Не забудьте сохранить настройки!')
  }

  // Редактирование изображения
  const editImage = (vehicleValue: string) => {
    setCurrentVehicleValue(vehicleValue)
    setImageFormData({
      imageUrl: customImages[vehicleValue] || ''
    })
    setIsImageEditDialogOpen(true)
  }

  // Сохранение изображения
  const saveImage = () => {
    if (!currentVehicleValue) return

    // Обновляем объект с кастомными изображениями
    const updatedImages = { ...customImages }

    if (imageFormData.imageUrl) {
      updatedImages[currentVehicleValue] = imageFormData.imageUrl
    } else {
      // Если URL пустой, удаляем кастомное изображение
      delete updatedImages[currentVehicleValue]
    }

    setCustomImages(updatedImages)
    setIsImageEditDialogOpen(false)
    toast.success('Изображение обновлено. Не забудьте сохранить настройки!')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">Настройка модального окна заказа трансфера</h2>
          <p className="text-sm text-gray-500 mt-1">
            Управление заголовком, описанием и отображением автомобилей в форме заказа трансфера
          </p>
        </div>
        <Button onClick={() => setIsConfigEditDialogOpen(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Редактировать настройки
        </Button>
      </div>

      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-2" />
            Предпросмотр
          </TabsTrigger>
          <TabsTrigger value="vehicles">
            <Car className="w-4 h-4 mr-2" />
            Автомобили ({transferConfig?.vehicles?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{transferConfig?.title || 'Заказать трансфер'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                {transferConfig?.description || 'Заполните форму ниже, и мы свяжемся с вами для подтверждения заказа'}
              </p>

              <h3 className="font-medium mb-2">Предпросмотр секции выбора автомобиля:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {transferConfig?.vehicles?.slice(0, 3).map((vehicle) => (
                  <div key={vehicle.value} className="border-2 border-primary rounded-lg overflow-hidden h-full">
                    <div className="relative aspect-video w-full overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${customImages[vehicle.value] || vehicle.image || '/images/vehicles/standard.jpg'})` }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Car className="h-12 w-12 text-white/80" />
                      </div>
                      <div className="absolute top-2 right-2 bg-primary/90 text-white text-xs px-2 py-1 rounded-full">
                        {vehicle.price}
                      </div>
                    </div>
                    <div className="p-4">
                      <div>
                        <h3 className="font-medium">{vehicle.label}</h3>
                        <p className="text-xs text-gray-600">{vehicle.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {transferConfig?.vehicles && transferConfig.vehicles.length > 3 && (
                  <div className="flex items-center justify-center border border-dashed border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      и еще {transferConfig.vehicles.length - 3} автомобиля...
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Автомобили в модальном окне</h3>
                  <p className="text-sm text-gray-500">
                    {formData.useVehiclesFromDb
                      ? 'Отображаются автомобили из базы данных'
                      : 'Используются настроенные вручную автомобили'}
                  </p>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsConfigEditDialogOpen(true)}
                    className="flex items-center"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    {formData.useVehiclesFromDb
                      ? 'Использовать автомобили из БД'
                      : 'Настроить вручную'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {transferConfig?.vehicles?.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.value}
                    vehicle={vehicle}
                    onEdit={editVehicle}
                    onImageEdit={editImage}
                    customImages={customImages}
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => fetchTransferConfig()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить список
              </Button>
              <Button onClick={() => setIsConfigEditDialogOpen(true)}>
                Сохранить настройки
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог редактирования настроек */}
      <Dialog open={isConfigEditDialogOpen} onOpenChange={setIsConfigEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Настройки модального окна трансфера</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок окна *</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleConfigChange}
                placeholder="Заказать трансфер"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleConfigChange}
                placeholder="Заполните форму ниже, и мы свяжемся с вами для подтверждения заказа"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-4 pt-2">
              <Switch
                id="useVehiclesFromDb"
                checked={formData.useVehiclesFromDb}
                onCheckedChange={handleConfigCheckboxChange}
              />
              <div className="grid gap-1.5">
                <Label htmlFor="useVehiclesFromDb">
                  Использовать автомобили из базы данных
                </Label>
                <p className="text-sm text-gray-500">
                  Если включено, берутся автомобили из раздела "Автопарк".
                  Если выключено, можно настроить список вручную.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfigEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={saveTransferConfig}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования автомобиля */}
      <Dialog open={isVehicleEditDialogOpen} onOpenChange={setIsVehicleEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Редактирование автомобиля</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Класс автомобиля *</label>
                <Input
                  name="label"
                  value={vehicleFormData.label}
                  onChange={handleVehicleChange}
                  placeholder="Например: Standart, Comfort"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Идентификатор *</label>
                <Input
                  name="value"
                  value={vehicleFormData.value}
                  onChange={handleVehicleChange}
                  placeholder="Например: standard, comfort"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Используется как внутренний идентификатор. Используйте только латинские буквы, цифры и дефисы
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Цена *</label>
                <Input
                  name="price"
                  value={vehicleFormData.price}
                  onChange={handleVehicleChange}
                  placeholder="от 250.00 EUR"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL изображения</label>
                <Input
                  name="image"
                  value={vehicleFormData.image}
                  onChange={handleVehicleChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <Input
                name="desc"
                value={vehicleFormData.desc}
                onChange={handleVehicleChange}
                placeholder="Например: Mercedes Benz E class"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVehicleEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={saveVehicle}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования изображения */}
      <Dialog open={isImageEditDialogOpen} onOpenChange={setIsImageEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Изображение для автомобиля</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-gray-600">
              Укажите URL изображения, которое будет отображаться в модальном окне.
              Если поле оставить пустым, будет использоваться изображение из базы данных.
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">URL изображения</label>
              <Input
                name="imageUrl"
                value={imageFormData.imageUrl}
                onChange={handleImageChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {imageFormData.imageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Предпросмотр:</p>
                <div className="relative rounded-lg overflow-hidden h-48 bg-gray-100">
                  <img
                    src={imageFormData.imageUrl}
                    alt="Предпросмотр"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/600x400?text=Ошибка+загрузки';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImageEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={saveImage}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Компонент иконки глаза для предпросмотра
function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
