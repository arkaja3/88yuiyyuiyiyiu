'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { FaInstagram, FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { useSettings } from '@/lib/settings-context'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { settings } = useSettings()

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="animate-fade-in">
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <Image
                  src="/images/footer-logo.png"
                  alt={settings.companyName}
                  width={150}
                  height={40}
                  className="h-10 w-auto object-contain mr-2"
                />
                <h3 className="text-base font-medium">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                    {settings.companyName}
                  </span>
                </h3>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              {settings.companyDesc}
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href={settings.instagramLink}
                className="bg-pink-600 hover:bg-pink-700 p-2 rounded-full transition-colors"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href={settings.telegramLink}
                className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-colors"
                aria-label="Telegram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTelegram className="w-5 h-5" />
              </a>
              <a
                href={settings.whatsappLink}
                className="bg-green-600 hover:bg-green-700 p-2 rounded-full transition-colors"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Быстрые ссылки</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/#routes" className="text-gray-400 hover:text-white transition-colors">
                  Маршруты
                </Link>
              </li>
              <li>
                <Link href="/#vehicles" className="text-gray-400 hover:text-white transition-colors">
                  Автомобили
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="text-gray-400 hover:text-white transition-colors">
                  Преимущества
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="text-gray-400 hover:text-white transition-colors">
                  Отзывы
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Блог
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6">Контакты</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-blue-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400">{settings.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s+/g, '')}`} className="text-gray-400 hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center">
                <Clock className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                <span className="text-gray-400">{settings.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6">О компании</h3>
            <p className="text-gray-400 mb-4">
              RoyalTransfer — это комфортные трансферы из Калининграда по всей Европе. Мы работаем для того, чтобы ваше путешествие было максимально комфортным и безопасным.
            </p>
            <p className="text-gray-400">
              Выбирая нас, вы выбираете качество, пунктуальность и безопасность.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>
            © {currentYear} {settings.companyName}. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
