'use client'

import { useEffect, useRef, useState } from 'react'
import { useSettings } from '@/lib/settings-context'
import { loadGoogleMapsApi } from '@/lib/load-google-maps-api'
import { MapPin } from 'lucide-react'

interface ContactMapProps {
  height?: string
  className?: string
  apiKey?: string
}

export function ContactMap({ height = '250px', className = '', apiKey = '' }: ContactMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { settings } = useSettings()

  // Используем встроенный iframe с точными координатами RosTransfer
  // Координаты уже включены в iframe-код
  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2304.700207395449!2d20.503843679345696!3d54.71489740260828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46e3160176045ef1%3A0xba083d014399e1eb!2zUm9zVHJhbnNmZXIg0KLRgNCw0L3RgdGE0LXRgNGLINC_0L4g0JXQstGA0L7Qv9C1LCDQoNC-0YHRgdC40Lgg0Lgg0YHRgtGA0LDQvdCw0Lwg0KHQndCTLCDQsdC40LfQvdC10YEg0YLQsNC60YHQuA!5e0!3m2!1sru!2sru!4v1744328547437!5m2!1sru!2sru"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="RosTransfer на карте"
      />
    </div>
  )
}