'use client'

import React, { useState } from 'react'
import { useHomeSettings } from '@/lib/home-settings-context'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'
import { Check, Clock, MapPin } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type IconOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

export default function HomeSettingsForm() {
  const { homeSettings, updateHomeSettings, loading } = useHomeSettings()

  const [formData, setFormData] = useState({
    title: homeSettings.title,
    subtitle: homeSettings.subtitle,
    backgroundImageUrl: homeSettings.backgroundImageUrl,
    feature1Title: homeSettings.feature1Title,
    feature1Text: homeSettings.feature1Text,
    feature1Icon: homeSettings.feature1Icon,
    feature2Title: homeSettings.feature2Title,
    feature2Text: homeSettings.feature2Text,
    feature2Icon: homeSettings.feature2Icon,
    feature3Title: homeSettings.feature3Title,
    feature3Text: homeSettings.feature3Text,
    feature3Icon: homeSettings.feature3Icon,
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const [bgPreviewError, setBgPreviewError] = useState(false)

  // Доступные иконки
  const iconOptions: IconOption[] = [
    { value: 'MapPin', label: 'Локация', icon: <MapPin className="h-4 w-4" /> },
    { value: 'Clock', label: 'Часы', icon: <Clock className="h-4 w-4" /> },
    { value: 'Check', label: 'Галочка', icon: <Check className="h-4 w-4" /> },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'backgroundImageUrl') {
      setBgPreviewError(false)
    }
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Валидация обязательных полей
    if (!formData.title.trim() || !formData.subtitle.trim()) {
      toast.error('Пожалуйста, заполните все обязательные поля')
      return
    }

    setIsUpdating(true)
    try {
      await updateHomeSettings(formData)
      toast.success('Настройки главного блока успешно обновлены')
    } catch (err) {
      toast.error('Не удалось обновить настройки главного блока')
      console.error(err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Настройки главного блока</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Заголовок главной страницы *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                Подзаголовок *
              </label>
              <Textarea
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full"
                required
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="backgroundImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                URL фонового изображения
              </label>
              <Input
                id="backgroundImageUrl"
                name="backgroundImageUrl"
                type="url"
                value={formData.backgroundImageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full"
              />

              {formData.backgroundImageUrl && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Предпросмотр:</p>
                  <div className="border border-gray-200 rounded-md overflow-hidden h-40 relative">
                    {!bgPreviewError ? (
                      <Image
                        src={formData.backgroundImageUrl}
                        alt="Фоновое изображение"
                        fill
                        className="object-cover"
                        onError={() => setBgPreviewError(true)}
                      />
                    ) : (
                      <div className="text-red-500 text-sm p-4 flex items-center justify-center h-full">
                        Ошибка загрузки изображения. Проверьте URL.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Блок преимущества 1 */}
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Блок преимущества 1</h3>

                <div className="mb-4">
                  <label htmlFor="feature1Icon" className="block text-sm font-medium text-gray-700 mb-1">
                    Иконка
                  </label>
                  <Select
                    value={formData.feature1Icon}
                    onValueChange={(value) => handleSelectChange(value, 'feature1Icon')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите иконку" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <label htmlFor="feature1Title" className="block text-sm font-medium text-gray-700 mb-1">
                    Заголовок
                  </label>
                  <Input
                    id="feature1Title"
                    name="feature1Title"
                    value={formData.feature1Title}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="feature1Text" className="block text-sm font-medium text-gray-700 mb-1">
                    Текст
                  </label>
                  <Input
                    id="feature1Text"
                    name="feature1Text"
                    value={formData.feature1Text}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Блок преимущества 2 */}
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Блок преимущества 2</h3>

                <div className="mb-4">
                  <label htmlFor="feature2Icon" className="block text-sm font-medium text-gray-700 mb-1">
                    Иконка
                  </label>
                  <Select
                    value={formData.feature2Icon}
                    onValueChange={(value) => handleSelectChange(value, 'feature2Icon')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите иконку" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <label htmlFor="feature2Title" className="block text-sm font-medium text-gray-700 mb-1">
                    Заголовок
                  </label>
                  <Input
                    id="feature2Title"
                    name="feature2Title"
                    value={formData.feature2Title}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="feature2Text" className="block text-sm font-medium text-gray-700 mb-1">
                    Текст
                  </label>
                  <Input
                    id="feature2Text"
                    name="feature2Text"
                    value={formData.feature2Text}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Блок преимущества 3 */}
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Блок преимущества 3</h3>

                <div className="mb-4">
                  <label htmlFor="feature3Icon" className="block text-sm font-medium text-gray-700 mb-1">
                    Иконка
                  </label>
                  <Select
                    value={formData.feature3Icon}
                    onValueChange={(value) => handleSelectChange(value, 'feature3Icon')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите иконку" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mb-4">
                  <label htmlFor="feature3Title" className="block text-sm font-medium text-gray-700 mb-1">
                    Заголовок
                  </label>
                  <Input
                    id="feature3Title"
                    name="feature3Title"
                    value={formData.feature3Title}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="feature3Text" className="block text-sm font-medium text-gray-700 mb-1">
                    Текст
                  </label>
                  <Input
                    id="feature3Text"
                    name="feature3Text"
                    value={formData.feature3Text}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <CardFooter className="px-0 pb-0">
            <Button
              type="submit"
              disabled={isUpdating || loading}
              className="ml-auto"
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}
