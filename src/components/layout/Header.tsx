'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X, Phone, ChevronRight } from 'lucide-react'
import { FaInstagram, FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import BookingForm from '@/components/forms/BookingForm'
import { useSettings } from '@/lib/settings-context'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { settings } = useSettings()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Добавляем эффект для предотвращения прокрутки страницы при открытом меню
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Обработчик диалога
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (open) {
      setIsMenuOpen(false)
    }
  }

  // Navigation links
  const navLinks = [
    { name: 'Главная', href: '/' },
    { name: 'Маршруты', href: '/#routes' },
    { name: 'Автомобили', href: '/#vehicles' },
    { name: 'Преимущества', href: '/#benefits' },
    { name: 'Отзывы', href: '/#reviews' },
    { name: 'Фотогалерея', href: '/gallery' }, // Added menu item
    { name: 'Блог', href: '/blog' },
    { name: 'Контакты', href: '/#contacts' },
    { name: 'Политика конфиденциальности', href: '/privacy-policy' },
  ]

  // Определяем, находимся ли мы на главной странице
  const isHomePage = pathname === '/' || pathname === '/#'

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-primary flex items-center space-x-2 group mr-auto"
        >
          {/* Логотип и название компании */}
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt={settings.companyName}
              width={150}
              height={40}
              className="h-10 w-auto object-contain mr-2 custom-logo"
              priority
            />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 hidden sm:inline text-sm font-medium company-name">
              {settings.companyName}
            </span>
          </div>
        </Link>

        {/* Phone and Book Button - Visible on all screens */}
        <div className="flex items-center space-x-2 ml-auto mr-4">
          <a
            href={`tel:${settings.phone.replace(/\s+/g, '')}`}
            className={`flex items-center text-sm font-medium transition-colors phone-link hidden sm:flex ${
              isScrolled || !isHomePage
                ? 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary'
                : 'text-white hover:text-white/80'
            }`}
          >
            <Phone className={`w-4 h-4 mr-2 animate-pulse ${
              isScrolled || !isHomePage ? 'text-primary' : 'text-white'
            }`} />
            <span>{settings.phone}</span>
          </a>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="btn-gradient text-white font-medium book-button hidden sm:flex">
                Заказать трансфер
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] p-0 overflow-hidden">
              <DialogTitle className="sr-only">Заказать трансфер</DialogTitle>
              <BookingForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Menu button - Visible on all screens */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          className="relative group"
        >
          <div className="flex flex-col justify-center items-center w-6 h-6">
            <span className={`block w-5 h-0.5 ${isScrolled ? 'bg-gray-700 dark:bg-gray-200' : 'bg-white'} rounded-full transition-all duration-300 ease-out ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
            <span className={`block w-5 h-0.5 ${isScrolled ? 'bg-gray-700 dark:bg-gray-200' : 'bg-white'} rounded-full transition-all duration-300 ease-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-5 h-0.5 ${isScrolled ? 'bg-gray-700 dark:bg-gray-200' : 'bg-white'} rounded-full transition-all duration-300 ease-out ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
          </div>
        </Button>
      </div>

      {/* Fullscreen Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white/95 dark:bg-gray-900/95 z-40 backdrop-blur-md overflow-y-auto"
            style={{ top: isScrolled ? '3.5rem' : '4rem' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: `calc(100vh - ${isScrolled ? '3.5rem' : '4rem'})` }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="container mx-auto py-6 px-4 flex flex-col h-full menu-container">
              <div className="overflow-y-auto flex-1">
                <nav className="flex flex-col space-y-4 mb-6">
                  <div className="space-y-1 px-2 pb-3 pt-2">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                      >
                        <Link
                          href={link.href}
                          className={`block rounded-md px-3 py-2 text-base font-medium ${pathname === link.href ? 'bg-gray-100 text-primary-500' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                <motion.div
                  className="mt-4 pb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {/* Контактная информация и социальные сети */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 shadow-sm mb-5 contact-card">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Связаться с нами</h3>

                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                      className="flex items-center text-base font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors mb-4 contact-text"
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <span>{settings.phone}</span>
                    </a>

                    <div className="flex items-center justify-between">
                      <a
                        href={settings.instagramLink}
                        className="flex flex-col items-center justify-center"
                        aria-label="Instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-1 transform hover:scale-110 transition-transform social-icon">
                          <FaInstagram className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Instagram</span>
                      </a>

                      <a
                        href={settings.telegramLink}
                        className="flex flex-col items-center justify-center"
                        aria-label="Telegram"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-1 transform hover:scale-110 transition-transform social-icon">
                          <FaTelegram className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Telegram</span>
                      </a>

                      <a
                        href={settings.whatsappLink}
                        className="flex flex-col items-center justify-center"
                        aria-label="WhatsApp"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-1 transform hover:scale-110 transition-transform social-icon">
                          <FaWhatsapp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Кнопка заказа трансфера в мобильной версии */}
                  <div className="sm:hidden">
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full py-4 rounded-xl btn-gradient text-white font-medium text-base shadow-lg relative overflow-hidden group mb-4 order-button-mobile"
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Заказать трансфер
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                          <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[625px] p-0 overflow-hidden">
                        <DialogTitle className="sr-only">Заказать трансфер</DialogTitle>
                        <BookingForm />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    © {new Date().getFullYear()} {settings.companyName}. Все права защищены.
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Стили для адаптации */}
      <style jsx global>{`
        /* Базовые стили для адаптивности */
        .custom-logo {
          height: 2.5rem;
          width: auto;
        }

        /* Адаптация для разных разрешений */
        @media (max-width: 640px) {
          .custom-logo {
            height: 2rem;
          }

          .phone-link {
            font-size: 0.75rem;
          }

          .phone-link svg {
            width: 0.75rem;
            height: 0.75rem;
          }

          .social-icon {
            width: 2.25rem;
            height: 2.25rem;
          }
        }

        /* Специфичная адаптация для iPhone SE и подобных */
        @media (max-width: 375px) {
          .menu-container {
            padding: 0.75rem 0.5rem;
          }

          .social-icon {
            width: 2rem;
            height: 2rem;
          }

          .contact-text {
            font-size: 0.85rem;
          }

          .order-button-mobile {
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </header>
  )
}
