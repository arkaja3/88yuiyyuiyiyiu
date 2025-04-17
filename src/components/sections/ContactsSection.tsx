'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { useSettings } from '@/lib/settings-context'
import { ContactMap } from '@/components/ui/contact-map'

export default function ContactsSection() {
  const { settings } = useSettings()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsSuccess(false)
    setError('')

    try {
      // Валидация обязательных полей
      if (!formData.name.trim()) {
        setError('Пожалуйста, введите ваше имя')
        toast.error('Пожалуйста, введите ваше имя')
        setIsSubmitting(false)
        return
      }

      if (!formData.email.trim()) {
        setError('Пожалуйста, введите ваш email')
        toast.error('Пожалуйста, введите ваш email')
        setIsSubmitting(false)
        return
      }

      if (!formData.message.trim()) {
        setError('Пожалуйста, введите сообщение')
        toast.error('Пожалуйста, введите сообщение')
        setIsSubmitting(false)
        return
      }

      // Сохраняем заявку напрямую в базу данных
      const apiUrl = '/api/contact-requests';
      console.log(`Сохранение формы в базу данных через API: ${apiUrl}`);

      // Отправка данных
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при отправке формы')
      }

      // Очистка формы при успешной отправке
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      })

      setIsSuccess(true)
      toast.success('Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.')
    } catch (error) {
      console.error('Ошибка при отправке формы:', error)
      setError('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз позже.')
      toast.error('Ошибка при отправке формы. Пожалуйста, попробуйте еще раз позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contacts" className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-underline inline-block">
            Контакты
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Есть вопросы или хотите заказать трансфер? Свяжитесь с нами любым удобным способом
            или оставьте сообщение, и мы ответим вам в ближайшее время.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Контактная информация */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Наши контакты
            </h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full text-primary mr-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Адрес</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {settings.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full text-primary mr-4">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Телефон</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    <a href={`tel:${settings.phone.replace(/[\s()-]/g, '')}`} className="hover:text-primary transition-colors">
                      {settings.phone}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full text-primary mr-4">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Email</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    <a href={`mailto:${settings.email}`} className="hover:text-primary transition-colors">
                      {settings.email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full text-primary mr-4">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Режим работы</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {settings.workingHours}<br />
                    Работаем без выходных
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Найдите нас на карте
              </h3>
              <ContactMap
                height="300px"
                className="rounded-lg shadow-md"
              />
            </div>
          </motion.div>

          {/* Форма обратной связи */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Отправить сообщение
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Ваше имя
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input-focus"
                  placeholder="Введите ваше имя"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input-focus"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Телефон
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-input-focus"
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Сообщение
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-input-focus min-h-[150px]"
                  placeholder="Напишите ваше сообщение здесь..."
                  required
                />
              </div>

              <Button
                type="submit"
                className="btn-gradient w-full md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Отправка...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Отправить сообщение
                    <Send className="ml-2 w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
