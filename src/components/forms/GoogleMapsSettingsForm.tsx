'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Info } from 'lucide-react'

const googleMapsSettingsSchema = z.object({
  googleMapsApiKey: z.string().nullable().optional(),
})

type GoogleMapsSettingsFormValues = z.infer<typeof googleMapsSettingsSchema>

export default function GoogleMapsSettingsForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Инициализируем форму
  const form = useForm<GoogleMapsSettingsFormValues>({
    resolver: zodResolver(googleMapsSettingsSchema),
    defaultValues: {
      googleMapsApiKey: '',
    },
  })

  // Получаем настройки при загрузке компонента
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/settings')

        if (!response.ok) {
          throw new Error('Не удалось загрузить настройки')
        }

        const data = await response.json()

        // Заполняем форму данными из API
        if (data.settings) {
          form.reset({
            googleMapsApiKey: data.settings.googleMapsApiKey || '',
          })
        }
      } catch (err) {
        console.error('Ошибка при загрузке настроек:', err)
        setError('Не удалось загрузить настройки. Пожалуйста, попробуйте позже.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [form])

  // Функция отправки формы
  const onSubmit = async (data: GoogleMapsSettingsFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Не удалось сохранить настройки')
      }

      toast.success('Настройки Google Maps успешно сохранены')
    } catch (err) {
      console.error('Ошибка при сохранении настроек:', err)
      setError('Не удалось сохранить настройки. Пожалуйста, попробуйте позже.')
      toast.error('Ошибка при сохранении настроек')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !form.formState.isSubmitting) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки Google Maps</CardTitle>
        <CardDescription>
          Настройка API ключа Google Maps для отображения карты в форме заказа трансфера
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Информация</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Для работы с картой необходимо получить API ключ Google Maps Platform. Для этого:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Зайдите в <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a></li>
              <li>Создайте новый проект или выберите существующий</li>
              <li>Включите следующие API:
                <ul className="list-disc pl-5 mt-1">
                  <li>Maps JavaScript API</li>
                  <li>Directions API</li>
                  <li>Geocoding API</li>
                  <li>Places API</li>
                </ul>
              </li>
              <li>Создайте ключ API в разделе Credentials</li>
              <li>Для защиты ключа рекомендуется настроить ограничения по HTTP-реферерам</li>
            </ol>
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="googleMapsApiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API ключ Google Maps</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите API ключ Google Maps..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    API ключ будет использоваться для отображения карты в форме заказа трансфера
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить настройки'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
