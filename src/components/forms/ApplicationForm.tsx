'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { X, MessageSquare, Phone } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { useSettings } from '@/lib/settings-context'

// Схема валидации формы заявки с модификацией для contactMethod
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Имя должно содержать не менее 2 символов',
  }),
  phone: z.string().min(10, {
    message: 'Укажите корректный номер телефона',
  }),
  contactMethod: z.string().min(1, {
    message: 'Выберите способ связи'
  }),
  agreement: z.boolean().refine(val => val === true, {
    message: 'Необходимо согласие на обработку персональных данных',
  }),
})

// Тип пропсов для компонента
interface ApplicationFormProps {
  onClose?: () => void;
}

export default function ApplicationForm({ onClose }: ApplicationFormProps = {}) {
  const { settings } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [selectedContactMethod, setSelectedContactMethod] = useState<string | null>(null)

  // Инициализация формы
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      contactMethod: '',
      agreement: false,
    },
  })

  // Функция для закрытия диалога
  const closeDialog = () => {
    if (onClose) {
      onClose();
    } else {
      // Запасной вариант закрытия, если не передан onClose
      const dialog = document.querySelector('[role="dialog"]')?.closest('div[data-state="open"]');
      if (dialog) {
        dialog.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
      }
    }
  };

  // Функция для переключения выбора контактного метода
  const handleContactMethodChange = (value: string) => {
    if (selectedContactMethod === value) {
      // Если метод уже выбран, отменяем выбор
      setSelectedContactMethod(null);
      form.setValue('contactMethod', '');
    } else {
      // Иначе выбираем новый метод
      setSelectedContactMethod(value);
      form.setValue('contactMethod', value);
    }
    // Запускаем валидацию поля
    form.trigger('contactMethod');
  };

  // Функция форматирования телефонного номера
  const formatPhoneNumber = (value: string) => {
    // Удаляем все не-цифровые символы
    const phoneNumber = value.replace(/\D/g, '');

    // Форматируем номер по маске +7 (xxx) xxx-xx-xx
    if (phoneNumber.length === 0) {
      return '';
    } else if (phoneNumber.length <= 1) {
      return `+${phoneNumber}`;
    } else if (phoneNumber.length <= 4) {
      return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1)}`;
    } else if (phoneNumber.length <= 7) {
      return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4)}`;
    } else if (phoneNumber.length <= 9) {
      return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
    } else {
      return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
    }
  };

  // Обработчик изменения телефонного номера
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    form.setValue('phone', formattedValue);
  };

  // Обработка отправки формы
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setIsSuccess(false)
    setError('')

    try {
      // Проверяем, что contactMethod выбран
      if (!data.contactMethod) {
        setError('Пожалуйста, выберите предпочтительный способ связи')
        setIsSubmitting(false)
        return
      }

      // Очищаем телефонный номер от форматирования перед отправкой
      const cleanPhone = data.phone.replace(/\D/g, '');

      const response = await fetch('/api/application-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          phone: cleanPhone,
          contactMethod: data.contactMethod,
          agreement: data.agreement
        }),
      })

      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error('Ошибка при парсинге JSON ответа:', e);
        throw new Error('Ошибка при обработке ответа от сервера');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при отправке формы')
      }

      // Очищаем форму при успешной отправке
      form.reset()
      setSelectedContactMethod(null)
      setIsSuccess(true)
      toast.success('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.')

      // Закрываем модальное окно после небольшой задержки
      setTimeout(() => {
        closeDialog();
      }, 3000)
    } catch (error) {
      console.error('Ошибка при отправке формы:', error)
      setError(error instanceof Error ? error.message : 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз позже.')
      toast.error('Ошибка при отправке формы. Пожалуйста, попробуйте еще раз позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Проверка наличия ошибок в форме
  useEffect(() => {
    const subscription = form.watch(() => {
      if (Object.keys(form.formState.errors).length > 0) {
        console.log('Ошибки формы:', form.formState.errors);
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch, form.formState.errors]);

  return (
    <div className="relative max-h-[90vh] overflow-y-auto pb-20">
      <div className="sticky top-0 bg-white dark:bg-gray-950 z-10 p-4 flex items-center justify-between border-b">
        <h2 className="text-xl font-bold">Оставить заявку</h2>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={closeDialog}
          type="button"
          aria-label="Закрыть"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Закрыть</span>
        </Button>
      </div>

      <div className="p-6">
        {isSuccess ? (
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Заявка принята!</h3>
            <p className="text-gray-600 mb-6">Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              Заполните форму ниже, и мы свяжемся с вами для получения дополнительной информации
            </p>

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
                          <Input
                            placeholder="+7 (___) ___-__-__"
                            value={field.value}
                            onChange={(e) => {
                              handlePhoneChange(e);
                              field.onChange(e);
                            }}
                            className="form-input-focus"
                            inputMode="tel"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contactMethod"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Предпочтительный способ связи</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div
                          className={`flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:bg-slate-50 ${selectedContactMethod === 'telegram' ? 'bg-slate-50 border-primary' : ''}`}
                          onClick={() => handleContactMethodChange('telegram')}
                          aria-selected={selectedContactMethod === 'telegram'}
                          role="radio"
                          aria-checked={selectedContactMethod === 'telegram'}
                        >
                          <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 2c5.525 0 10 4.475 10 10s-4.475 10-10 10S2 17.525 2 12 6.475 2 12 2zm2.807 14.05l-.556-2.665-4.95 2.647 5.451-5.088-3.396-2.416 4.95-2.647-5.451 5.088 3.952 5.081z"/>
                          </svg>
                          <span className="text-center">Telegram</span>
                        </div>

                        <div
                          className={`flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:bg-slate-50 ${selectedContactMethod === 'whatsapp' ? 'bg-slate-50 border-primary' : ''}`}
                          onClick={() => handleContactMethodChange('whatsapp')}
                          aria-selected={selectedContactMethod === 'whatsapp'}
                          role="radio"
                          aria-checked={selectedContactMethod === 'whatsapp'}
                        >
                          <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.72.045.477-.096.881zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                          </svg>
                          <span className="text-center">WhatsApp</span>
                        </div>

                        <div
                          className={`flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:bg-slate-50 ${selectedContactMethod === 'call' ? 'bg-slate-50 border-primary' : ''}`}
                          onClick={() => handleContactMethodChange('call')}
                          aria-selected={selectedContactMethod === 'call'}
                          role="radio"
                          aria-checked={selectedContactMethod === 'call'}
                        >
                          <Phone className="h-5 w-5 text-red-500" />
                          <span className="text-center">Звонок</span>
                        </div>
                      </div>
                      {/* Скрытый input для надежного хранения значения */}
                      <input
                        type="hidden"
                        {...field}
                        value={selectedContactMethod || ''}
                      />
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

                {error && (
                  <div className="p-3 rounded bg-red-50 text-red-700 text-sm mt-4">
                    {error}
                  </div>
                )}

                <div className="submit-button-container sticky bottom-0 bg-white dark:bg-gray-950 py-4 mt-6 z-10">
                  <Button
                    type="submit"
                    className="w-full btn-gradient"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  )
}
