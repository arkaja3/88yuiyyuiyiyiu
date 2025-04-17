'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Тип для всех настроек сайта
type SiteSettings = {
  phone: string
  email: string
  address: string
  workingHours: string
  companyName: string
  companyDesc: string
  instagramLink: string
  telegramLink: string
  whatsappLink: string
  headerLogoUrl: string | null
  footerLogoUrl: string | null
  googleMapsApiKey: string
}

type SettingsContextType = {
  settings: SiteSettings
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>
  loading: boolean
  error: string | null
}

const defaultSettings: SiteSettings = {
  phone: "+7 (900) 000-00-00",
  email: "info@royaltransfer.ru",
  address: "г. Калининград, ул. Примерная, д. 123",
  workingHours: "Пн-Вс: 24/7",
  companyName: "RoyalTransfer",
  companyDesc: "Комфортные трансферы из Калининграда в города Европы. Безопасность, комфорт и пунктуальность.",
  instagramLink: "#",
  telegramLink: "#",
  whatsappLink: "#",
  headerLogoUrl: null,
  footerLogoUrl: null,
  googleMapsApiKey: ""  // Вы добавите свой ключ через админ-панель
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Загружаем настройки при первой загрузке
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()

        if (data.settings) {
          setSettings({
            phone: data.settings.phone || defaultSettings.phone,
            email: data.settings.email || defaultSettings.email,
            address: data.settings.address || defaultSettings.address,
            workingHours: data.settings.workingHours || defaultSettings.workingHours,
            companyName: data.settings.companyName || defaultSettings.companyName,
            companyDesc: data.settings.companyDesc || defaultSettings.companyDesc,
            instagramLink: data.settings.instagramLink || defaultSettings.instagramLink,
            telegramLink: data.settings.telegramLink || defaultSettings.telegramLink,
            whatsappLink: data.settings.whatsappLink || defaultSettings.whatsappLink,
            headerLogoUrl: data.settings.headerLogoUrl,
            footerLogoUrl: data.settings.footerLogoUrl,
            googleMapsApiKey: data.settings.googleMapsApiKey || defaultSettings.googleMapsApiKey
          })
        }
      } catch (err) {
        console.error('Ошибка при загрузке настроек:', err)
        setError('Не удалось загрузить настройки')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось обновить настройки')
      }

      // Обновляем только полученные поля, сохраняя остальные
      setSettings(prevSettings => ({
        ...prevSettings,
        ...data.settings
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(errorMessage)
      console.error('Ошибка при обновлении настроек:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings должен использоваться внутри SettingsProvider')
  }
  return context
}
