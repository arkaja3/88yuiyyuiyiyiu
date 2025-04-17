'use client'

// Объявление типов для Google Maps API в глобальном пространстве
declare global {
  interface Window {
    google?: any;
    initGoogleMaps?: () => void;
  }
}

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { CalendarIcon, Car, X, Map } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import 'isomorphic-fetch'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapView } from '@/components/ui/map-view'

// Тип для транспортного средства в форме
type VehicleOption = {
  value: string
  label: string
  price: string
  image?: string
  desc: string
  vehicleId?: number
}

// Тип для конфигурации трансфера
type TransferConfig = {
  id: number
  title: string
  description: string
  vehicles: VehicleOption[]
  useVehiclesFromDb: boolean
}

// Список доступных городов для выбора
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Имя должно содержать не менее 2 символов',
  }),
  phone: z.string().min(10, {
    message: 'Укажите корректный номер телефона',
  }),
  vehicleClass: z.string({
    required_error: 'Выберите класс автомобиля',
  }),
  date: z.date({
    required_error: 'Укажите дату поездки',
  }),
  time: z.string().min(1, {
    message: 'Укажите время поездки',
  }),
  originCity: z.string({
    required_error: 'Выберите город отправления',
  }),
  customOriginCity: z.string().optional(),
  originAddress: z.string().min(2, {
    message: 'Укажите адрес отправления',
  }),
  destinationCity: z.string({
    required_error: 'Выберите город прибытия',
  }),
  customDestinationCity: z.string().optional(),
  tellDriver: z.boolean().default(false),
  destinationAddress: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'online'], {
    required_error: 'Выберите способ оплаты',
  }),
  returnTransfer: z.enum(['no', 'yes'], {
    required_error: 'Укажите, нужен ли обратный трансфер',
  }),
  returnDate: z.date().optional(),
  returnTime: z.string().optional(),
  comments: z.string().optional(),
  agreement: z.boolean().refine(val => val === true, {
    message: 'Необходимо согласие на обработку персональных данных',
  }),
})
.refine((data) => {
  // Если выбран обратный трансфер, проверяем наличие даты и времени возвращения
  if (data.returnTransfer === 'yes') {
    return data.returnDate !== undefined && data.returnTime !== undefined && data.returnTime.length > 0;
  }
  return true;
}, {
  message: "Укажите дату и время обратного трансфера",
  path: ["returnDate"], // Показываем ошибку рядом с полем даты возвращения
})
.refine((data) => {
  // Проверка кастомного города отправления, если выбран "Другой город..."
  if (data.originCity === 'custom') {
    return data.customOriginCity !== undefined && data.customOriginCity.length >= 2;
  }
  return true;
}, {
  message: "Введите название города",
  path: ["customOriginCity"]
})
.refine((data) => {
  // Проверка кастомного города прибытия, если выбран "Другой город..."
  if (data.destinationCity === 'custom') {
    return data.customDestinationCity !== undefined && data.customDestinationCity.length >= 2;
  }
  return true;
}, {
  message: "Введите название города",
  path: ["customDestinationCity"]
})
.refine((data) => {
  // Проверка адреса прибытия, если не выбран чекбокс "Скажу водителю"
  if (!data.tellDriver) {
    return data.destinationAddress !== undefined && data.destinationAddress.length >= 2;
  }
  return true;
}, {
  message: "Укажите адрес прибытия или выберите 'Скажу водителю'",
  path: ["destinationAddress"]
});

// Основной компонент формы бронирования
export default function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [transferConfig, setTransferConfig] = useState<TransferConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Измененная форма с динамическим vehicleClass
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      vehicleClass: '',
      date: null,
      time: '',
      originCity: 'kaliningrad',
      customOriginCity: '',
      originAddress: '',
      destinationCity: '',
      customDestinationCity: '',
      tellDriver: false,
      destinationAddress: '',
      paymentMethod: 'cash',
      returnTransfer: 'no',
      returnTime: '',
      comments: '',
      agreement: false,
    },
  })

  // Загрузка конфигурации трансфера
  useEffect(() => {
    const fetchTransferConfig = async () => {
      try {
        setLoadingConfig(true)
        const response = await fetch('/api/transfers')
        const data = await response.json()

        if (data.config) {
          setTransferConfig(data.config)

          // Если есть автомобили, устанавливаем первый как значение по умолчанию
          if (data.config.vehicles && data.config.vehicles.length > 0) {
            form.setValue('vehicleClass', data.config.vehicles[0].value)
          }
        }
      } catch (error) {
        console.error('Error fetching transfer config:', error)
      } finally {
        setLoadingConfig(false)
      }
    }

    fetchTransferConfig()
  }, [form])

  // Загрузка Google Maps API при монтировании компонента
  useEffect(() => {
    // Функция для загрузки Google Maps API
    const loadGoogleMapsApi = async () => {
      // Проверка, загружен ли уже API
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      try {
        // Загружаем API ключ из настроек сайта
        const settingsResponse = await fetch('/api/settings');
        if (!settingsResponse.ok) {
          throw new Error('Не удалось загрузить настройки');
        }

        const settingsData = await settingsResponse.json();
        const apiKey = settingsData.settings?.googleMapsApiKey || '';

        if (!apiKey) {
          console.error('Google Maps API key is not defined in settings');
          return;
        }

        // Создаем функцию обратного вызова для инициализации
        window.initGoogleMaps = () => {
          setMapLoaded(true);
          console.log('Google Maps API loaded successfully');
        };

        // Добавляем скрипт Google Maps на страницу
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
      }
    };

    // Объявление типа для window с Google Maps API
    if (typeof window !== 'undefined') {
      window.initGoogleMaps = window.initGoogleMaps || (() => {});
      loadGoogleMapsApi();
    }
  }, []);

  // Наблюдаем за изменениями полей формы, влияющих на карту
  const originCity = form.watch('originCity');
  const destinationCity = form.watch('destinationCity');

  // Отображаем карту, когда выбраны оба города
  useEffect(() => {
    if (originCity && destinationCity && mapLoaded) {
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  }, [originCity, destinationCity, mapLoaded]);

  // Функция отправки формы - отправляет заявку прямо в базу данных без отправки по почте
  const onSubmit = async (formValues: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setIsSuccess(false);
    setError('');

    try {
      // Определяем города отправления и прибытия
      const originCity = formValues.originCity === 'custom' ? formValues.customOriginCity : cities.find(c => c.value === formValues.originCity)?.label;
      const destinationCity = formValues.destinationCity === 'custom' ? formValues.customDestinationCity : cities.find(c => c.value === formValues.destinationCity)?.label;

      // Создаем данные запроса
      const requestData = {
        customerName: formValues.name,
        customerPhone: formValues.phone,
        vehicleClass: formValues.vehicleClass,
        date: formValues.date,
        time: formValues.time,
        originCity: originCity,
        originAddress: formValues.originAddress,
        destinationCity: destinationCity,
        destinationAddress: formValues.tellDriver ? '' : formValues.destinationAddress,
        tellDriver: formValues.tellDriver,
        paymentMethod: formValues.paymentMethod,
        returnTransfer: formValues.returnTransfer === 'yes',
        returnDate: formValues.returnTransfer === 'yes' ? formValues.returnDate : null,
        returnTime: formValues.returnTransfer === 'yes' ? formValues.returnTime : null,
        comments: formValues.comments,
        vehicleId: vehicleOptions.find(v => v.value === formValues.vehicleClass)?.vehicleId,
        status: 'new'
      };

      // Отправляем заявку напрямую в базу данных через API
      const response = await fetch('/api/transfer-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Ошибка при отправке формы');
      }

      const result = await response.json();
      console.log('Результат отправки:', result);

      // Очищаем форму при успешной отправке
      form.reset();
      setIsSuccess(true);

      // Показываем сообщение об успешном создании заявки
      toast.success('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');

      // Закрываем модальное окно после небольшой задержки
      setTimeout(() => {
        document.querySelector('[role="dialog"]')?.closest('div[data-state="open"]')?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
      }, 3000);
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      setError('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз позже.');
      toast.error('Ошибка при отправке формы. Пожалуйста, попробуйте еще раз позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleOptions = transferConfig?.vehicles || [];

  // Показываем индикатор загрузки, пока настройки загружаются
  if (loadingConfig) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative max-h-[90vh] overflow-y-auto pb-20">
      <div className="sticky top-0 bg-white dark:bg-gray-950 z-10 p-4 flex items-center justify-between border-b">
        <h2 className="text-xl font-bold">{transferConfig?.title || 'Заказать трансфер'}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => document.querySelector('[role="dialog"]')?.closest('div[data-state="open"]')?.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Закрыть</span>
        </Button>
      </div>

      <div className="p-6">
        <p className="text-muted-foreground mb-6">
          {transferConfig?.description || 'Заполните форму ниже, и мы свяжемся с вами для подтверждения заказа'}
        </p>

        {/* Компонент мини-карты */}
        <div className="map-container">
          <MapView
            originCity={form.watch('originCity')}
            destinationCity={form.watch('destinationCity')}
            customOriginCity={form.watch('customOriginCity')}
            customDestinationCity={form.watch('customDestinationCity')}
            originAddress={form.watch('originAddress')}
            destinationAddress={form.watch('destinationAddress')}
            tellDriver={form.watch('tellDriver')}
            isVisible={showMap}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите ваше имя" {...field} className="form-input-focus" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Номер телефона</FormLabel>
                    <FormControl>
                      <Input placeholder="+7 (___) ___-__-__" {...field} className="form-input-focus" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-6" />

            <FormField
              control={form.control}
              name="vehicleClass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Класс автомобиля</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="form-input-focus">
                        <SelectValue placeholder="Выберите класс автомобиля" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <span className="mr-2">{option.label}</span>
                            <span className="text-xs text-gray-500">({option.price})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата</FormLabel>
                    {/* Для iOS используем нативный input type="date" */}
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          type="date"
                          className="form-input-focus w-full"
                          min={new Date().toISOString().split('T')[0]}
                          value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : null;
                            field.onChange(date);
                          }}
                          placeholder="Выберите дату"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Время</FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          type="time"
                          placeholder="Выберите время"
                          {...field}
                          className="form-input-focus w-full"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="originCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Город отправления</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="form-input-focus">
                            <SelectValue placeholder="Выберите город отправления" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Показать поле для ввода своего города, если выбран "Другой город..." */}
                {form.watch("originCity") === "custom" && (
                  <FormField
                    control={form.control}
                    name="customOriginCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Введите название города</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Например: Клайпеда"
                            {...field}
                            className="form-input-focus"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="originAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Адрес отправления</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Улица, дом, отель, аэропорт..."
                          {...field}
                          className="form-input-focus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="destinationCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Город прибытия</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="form-input-focus">
                            <SelectValue placeholder="Выберите город прибытия" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Показать поле для ввода своего города, если выбран "Другой город..." */}
                {form.watch("destinationCity") === "custom" && (
                  <FormField
                    control={form.control}
                    name="customDestinationCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Введите название города</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Например: Щецин"
                            {...field}
                            className="form-input-focus"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="tellDriver"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          Скажу водителю точный адрес при встрече
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {!form.watch("tellDriver") && (
                  <FormField
                    control={form.control}
                    name="destinationAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Адрес прибытия</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Улица, дом, отель, аэропорт..."
                            {...field}
                            className="form-input-focus"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Способ оплаты</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cash" id="payment-cash" />
                          <FormLabel className="font-normal cursor-pointer" htmlFor="payment-cash">Наличными</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="payment-card" />
                          <FormLabel className="font-normal cursor-pointer" htmlFor="payment-card">Банковской картой</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="online" id="payment-online" />
                          <FormLabel className="font-normal cursor-pointer" htmlFor="payment-online">Онлайн оплата</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returnTransfer"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Обратный трансфер</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="return-no" />
                          <FormLabel className="font-normal cursor-pointer" htmlFor="return-no">Не нужен</FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="return-yes" />
                          <FormLabel className="font-normal cursor-pointer" htmlFor="return-yes">Нужен</FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Поля для обратного трансфера (появляются только при выборе "Нужен") */}
            {form.watch('returnTransfer') === 'yes' && (
              <div className="grid gap-6 sm:grid-cols-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <FormField
                  control={form.control}
                  name="returnDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Дата обратного трансфера</FormLabel>
                      {/* Для iOS используем нативный input type="date" */}
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            type="date"
                            className="form-input-focus w-full"
                            min={new Date().toISOString().split('T')[0]}
                            value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                            onChange={(e) => {
                              const date = e.target.value ? new Date(e.target.value) : null;
                              field.onChange(date);
                            }}
                            placeholder="Выберите дату"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="returnTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Время обратного трансфера</FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            type="time"
                            placeholder="Выберите время"
                            {...field}
                            className="form-input-focus w-full"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Укажите детали заказа, адрес, количество пассажиров и т.д."
                      className="min-h-[80px] form-input-focus"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="agreement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">
                      Я согласен на обработку персональных данных
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="submit-button-container sticky bottom-0 bg-white dark:bg-gray-950 py-4 mt-6 z-10">
              <Button
                type="submit"
                className="w-full btn-gradient"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Заказать трансфер'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
