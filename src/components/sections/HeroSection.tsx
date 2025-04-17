'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MapPin, Clock, Check } from 'lucide-react'
import BookingForm from '@/components/forms/BookingForm'
import ApplicationForm from '@/components/forms/ApplicationForm'
import { useHomeSettings } from '@/lib/home-settings-context'

// Функция для выбора иконки по названию
const getIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case 'MapPin':
      return <MapPin className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'Check':
      return <Check className={className} />;
    default:
      return <MapPin className={className} />;
  }
};

export default function HeroSection() {
  const { homeSettings } = useHomeSettings();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  // Функция для открытия диалога заявки
  const openApplicationDialog = () => {
    setIsApplicationOpen(true);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  return (
    <section className="relative min-h-screen pt-24 pb-16 flex items-center overflow-hidden">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={homeSettings.backgroundImageUrl}
          alt="Трансфер"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 backdrop-blur-sm"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-10">
        <motion.div
          className="max-w-3xl text-white"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            variants={itemVariants}
          >
            {homeSettings.title}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl mb-8 text-gray-200"
            variants={itemVariants}
          >
            {homeSettings.subtitle}
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mb-12"
            variants={itemVariants}
          >
            <Dialog open={isApplicationOpen} onOpenChange={setIsApplicationOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="btn-gradient text-white text-lg font-medium animate-pulse"
                  onClick={openApplicationDialog}
                >
                  Оставить заявку
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-[625px] p-0 overflow-hidden"
                onEscapeKeyDown={() => setIsApplicationOpen(false)}
                aria-describedby="application-form-description"
              >
                <DialogTitle className="sr-only">Оставить заявку</DialogTitle>
                <DialogDescription id="application-form-description" className="sr-only">
                  Заполните форму заявки для связи с нами
                </DialogDescription>
                <ApplicationForm onClose={() => setIsApplicationOpen(false)} />
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-3 gap-6 text-center sm:text-left"
            variants={itemVariants}
          >
            <div className="flex flex-col items-center sm:items-start">
              <div className="bg-primary/20 p-3 rounded-full mb-4 animate-float">
                {getIcon(homeSettings.feature1Icon, "w-6 h-6 text-primary")}
              </div>
              <h3 className="text-lg font-semibold mb-2">{homeSettings.feature1Title}</h3>
              <p className="text-gray-300 text-sm">{homeSettings.feature1Text}</p>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <div className="bg-primary/20 p-3 rounded-full mb-4 animate-float" style={{ animationDelay: '0.2s' }}>
                {getIcon(homeSettings.feature2Icon, "w-6 h-6 text-primary")}
              </div>
              <h3 className="text-lg font-semibold mb-2">{homeSettings.feature2Title}</h3>
              <p className="text-gray-300 text-sm">{homeSettings.feature2Text}</p>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <div className="bg-primary/20 p-3 rounded-full mb-4 animate-float" style={{ animationDelay: '0.4s' }}>
                {getIcon(homeSettings.feature3Icon, "w-6 h-6 text-primary")}
              </div>
              <h3 className="text-lg font-semibold mb-2">{homeSettings.feature3Title}</h3>
              <p className="text-gray-300 text-sm">{homeSettings.feature3Text}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Animated car silhouette */}
        <motion.div
          className="hidden lg:block absolute right-0 bottom-0 w-[600px] h-[300px]"
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, type: 'spring' }}
        >
          <Image
            src="/images/car-silhouette.png"
            alt="Car"
            width={600}
            height={300}
            className="object-contain"
            onError={(e) => {
              // Fallback if image is not available
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </motion.div>
      </div>

      {/* Animated scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <motion.div
            className="bg-white w-1 h-3 rounded-full mt-2"
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        </motion.div>
      </div>
    </section>
  )
}
