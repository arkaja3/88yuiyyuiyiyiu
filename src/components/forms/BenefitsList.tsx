'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { AlertTriangle, Trash2, PlusCircle, Edit, MoveUp, MoveDown } from 'lucide-react'
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
  Phone
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

// Тип для данных о преимуществах
type Benefit = {
  id: number
  title: string
  description: string
  icon: string
  order: number
}

// Тип для статистики в секции преимуществ
type BenefitStats = {
  clients: string
  directions: string
  experience: string
  support: string
}

export default function BenefitsList() {
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [stats, setStats] = useState<BenefitStats>({
    clients: '5000+',
    directions: '15+',
    experience: '10+',
    support: '24/7'
  })
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [currentBenefit, setCurrentBenefit] = useState<Benefit | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Shield'
  })
  const [statsForm, setStatsForm] = useState({
    clients: '',
    directions: '',
    experience: '',
    support: ''
  })
  const [benefitsLoaded, setBenefitsLoaded] = useState(false)

  // Загрузка данных
  const fetchBenefits = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/benefits', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error('Ошибка при загрузке преимуществ')
      }

      const data = await response.json()

      if (data.benefits) {
        // Сортируем преимущества по полю order
        const sortedBenefits = [...data.benefits].sort((a, b) => a.order - b.order)
        setBenefits(sortedBenefits)
        setBenefitsLoaded(true)
      }

      if (data.stats) {
        setStats(data.stats)
        setStatsForm({
          clients: data.stats.clients || '',
          directions: data.stats.directions || '',
          experience: data.stats.experience || '',
          support: data.stats.support || ''
        })
      }
    } catch (error) {
      console.error('Error fetching benefits:', error)
      toast.error('Не удалось загрузить данные о преимуществах')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!benefitsLoaded) {
      fetchBenefits()
    }
  }, [benefitsLoaded])

  // Обработчик изменения формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Обработчик изменения формы статистики
  const handleStatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setStatsForm(prev => ({ ...prev, [name]: value }))
  }

  // Выбор иконки
  const handleIconSelect = (iconName: string) => {
    setFormData(prev => ({ ...prev, icon: iconName }))
  }

  // Создание или обновление преимущества
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim() || !formData.icon) {
      toast.error('Пожалуйста, заполните все поля')
      return
    }

    try {
      let response

      if (currentBenefit) {
        // Обновление существующего преимущества
        response = await fetch('/api/benefits', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'benefit',
            id: currentBenefit.id,
            title: formData.title.trim(),
            description: formData.description.trim(),
            icon: formData.icon
          })
        })
      } else {
        // Создание нового преимущества
        response = await fetch('/api/benefits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'benefit',
            title: formData.title.trim(),
            description: formData.description.trim(),
            icon: formData.icon
          })
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || 'Не удалось сохранить преимущество')
        } catch (parseError) {
          throw new Error('Ошибка связи с сервером')
        }
      }

      const data = await response.json()

      toast.success(currentBenefit ? 'Преимущество обновлено' : 'Преимущество добавлено')
      setIsModalOpen(false)
      resetForm()
      // Перезагружаем данные после изменений
      setBenefitsLoaded(false)
    } catch (error) {
      console.error('Error saving benefit:', error)
      let errorMessage = 'Не удалось сохранить преимущество'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    }
  }

  // Обновление статистики
  const handleStatsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/benefits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'stats',
          clients: statsForm.clients.trim(),
          directions: statsForm.directions.trim(),
          experience: statsForm.experience.trim(),
          support: statsForm.support.trim()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || 'Не удалось обновить статистику')
        } catch (parseError) {
          throw new Error('Ошибка связи с сервером')
        }
      }

      const data = await response.json()

      setStats(data.stats)
      setIsStatsDialogOpen(false)
      toast.success('Статистика обновлена')
    } catch (error) {
      console.error('Error updating stats:', error)
      let errorMessage = 'Не удалось обновить статистику'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
    }
  }

  // Удаление преимущества
  const deleteBenefit = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это преимущество?')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/benefits?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || 'Не удалось удалить преимущество')
        } catch (parseError) {
          throw new Error('Ошибка связи с сервером при удалении')
        }
      }

      // Получаем ответ от сервера
      const result = await response.json()

      if (result.success) {
        toast.success('Преимущество удалено')
        // Обновляем локальное состояние, удаляя элемент и пересчитывая order
        setBenefits(prev => {
          const updatedBenefits = prev.filter(b => b.id !== id)
            .map((b, index) => ({ ...b, order: index + 1 }))
          return updatedBenefits
        })
      } else {
        throw new Error(result.error || 'Не удалось удалить преимущество')
      }
    } catch (error) {
      console.error('Error deleting benefit:', error)
      let errorMessage = 'Не удалось удалить преимущество'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      toast.error(errorMessage)
      // После ошибки перезагружаем данные с сервера
      setBenefitsLoaded(false)
    } finally {
      setIsDeleting(false)
    }
  }

  // Изменение порядка преимуществ
  const handleMoveItem = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = benefits.findIndex(b => b.id === id)
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === benefits.length - 1)
    ) {
      return
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const currentItem = benefits[currentIndex]
    const targetItem = benefits[targetIndex]

    try {
      // Оптимистичное обновление UI
      const updatedBenefits = [...benefits]
      // Меняем местами элементы
      updatedBenefits[currentIndex] = { ...targetItem }
      updatedBenefits[targetIndex] = { ...currentItem }

      // Обновляем порядок
      updatedBenefits[currentIndex].order = currentIndex + 1
      updatedBenefits[targetIndex].order = targetIndex + 1

      // Сортируем массив по порядку
      updatedBenefits.sort((a, b) => a.order - b.order)

      // Обновляем состояние
      setBenefits(updatedBenefits)

      // Меняем местами порядковые номера на сервере
      const responses = await Promise.all([
        fetch('/api/benefits', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'benefit',
            id: currentItem.id,
            order: targetItem.order
          })
        }),
        fetch('/api/benefits', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'benefit',
            id: targetItem.id,
            order: currentItem.order
          })
        })
      ])

      // Проверяем, все ли запросы успешны
      for (const response of responses) {
        if (!response.ok) {
          throw new Error('Ошибка при обновлении порядка')
        }
      }
    } catch (error) {
      console.error('Error moving benefit:', error)
      toast.error('Не удалось изменить порядок')
      // В случае ошибки перезагружаем данные с сервера
      setBenefitsLoaded(false)
    }
  }

  // Редактирование преимущества
  const editBenefit = (benefit: Benefit) => {
    setCurrentBenefit(benefit)
    setFormData({
      title: benefit.title,
      description: benefit.description,
      icon: benefit.icon
    })
    setIsModalOpen(true)
  }

  // Сброс формы
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'Shield'
    })
    setCurrentBenefit(null)
  }

  // Отображение иконки по названию
  const renderIcon = (iconName: string) => {
    const IconComponent = availableIcons[iconName]
    return IconComponent ? <IconComponent className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />
  }

  if (loading && benefits.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Преимущества компании</h2>
        <div className="flex space-x-3">
          <Button onClick={() => setIsStatsDialogOpen(true)}>
            Статистика
          </Button>
          <Button onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Добавить преимущество
          </Button>
        </div>
      </div>

      {benefits.length === 0 && !loading ? (
        <p className="text-center text-gray-500 py-8">Нет добавленных преимуществ</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit) => (
            <Card key={benefit.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                      {renderIcon(benefit.icon)}
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveItem(benefit.id, 'up')}
                      disabled={benefit.order === 1 || isDeleting}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveItem(benefit.id, 'down')}
                      disabled={benefit.order === benefits.length || isDeleting}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editBenefit(benefit)}
                      disabled={isDeleting}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBenefit(benefit.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Статистика */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Статистические данные</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{stats.clients}</p>
              <p className="text-sm text-gray-600">Довольных клиентов</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{stats.directions}</p>
              <p className="text-sm text-gray-600">Направлений</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{stats.experience}</p>
              <p className="text-sm text-gray-600">Лет опыта</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{stats.support}</p>
              <p className="text-sm text-gray-600">Поддержка</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setIsStatsDialogOpen(true)} className="ml-auto">
            Редактировать статистику
          </Button>
        </CardFooter>
      </Card>

      {/* Модальное окно добавления/редактирования преимущества */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentBenefit ? 'Редактировать преимущество' : 'Добавить преимущество'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Заголовок</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Например: Безопасность"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Описание преимущества..."
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Иконка</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {Object.keys(availableIcons).map((iconName) => {
                  const IconComponent = availableIcons[iconName]
                  return (
                    <button
                      key={iconName}
                      type="button"
                      className={`p-2 rounded-lg border ${
                        formData.icon === iconName
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleIconSelect(iconName)}
                    >
                      <div className="flex flex-col items-center">
                        <IconComponent className="w-6 h-6" />
                        <span className="text-xs mt-1 truncate w-full text-center">
                          {iconName}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
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
                {currentBenefit ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Модальное окно редактирования статистики */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Редактировать статистику</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStatsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Количество клиентов</label>
              <Input
                name="clients"
                value={statsForm.clients}
                onChange={handleStatsChange}
                placeholder="Например: 5000+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Количество направлений</label>
              <Input
                name="directions"
                value={statsForm.directions}
                onChange={handleStatsChange}
                placeholder="Например: 15+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Опыт работы</label>
              <Input
                name="experience"
                value={statsForm.experience}
                onChange={handleStatsChange}
                placeholder="Например: 10+"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Поддержка</label>
              <Input
                name="support"
                value={statsForm.support}
                onChange={handleStatsChange}
                placeholder="Например: 24/7"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStatsDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
