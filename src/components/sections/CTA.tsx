'use client'

import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Car } from 'lucide-react'
import BookingForm from '@/components/forms/BookingForm'

export default function CTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Декоративные элементы */}
        <div
          className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"
          style={{ transform: 'translate(30%, 30%)' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Готовы заказать трансфер прямо сейчас?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Забронируйте поездку заранее и не беспокойтесь о транспорте во время путешествия.
              Мы предлагаем комфортные автомобили, опытных водителей и фиксированные цены без скрытых платежей.
            </p>

            <div className="flex flex-wrap gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 animate-pulse text-lg py-6 px-8">
                    Заказать трансфер
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px] p-0 overflow-hidden">
                  <BookingForm />
                </DialogContent>
              </Dialog>

              <a
                href="tel:+79000000000"
                className="inline-flex items-center justify-center py-6 px-8 border-2 border-white text-white hover:bg-white/10 transition-colors rounded-md text-lg"
              >
                Позвонить нам
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute animate-ping rounded-full h-32 w-32 bg-white/20"></div>
              <div className="relative flex items-center justify-center h-40 w-40 rounded-full bg-white/10 backdrop-blur-sm">
                <Car className="h-20 w-20 text-white" strokeWidth={1} />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="flex flex-wrap justify-center md:justify-start gap-4 mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: 0.3,
            staggerChildren: 0.1
          }}
        >
          {['Калининград - Гданьск', 'Калининград - Варшава', 'Калининград - Берлин', 'Калининград - Вильнюс'].map((route, index) => (
            <motion.div
              key={index}
              className="flex items-center rounded-full bg-white/10 backdrop-blur-sm py-2 px-4 text-sm"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {route}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
