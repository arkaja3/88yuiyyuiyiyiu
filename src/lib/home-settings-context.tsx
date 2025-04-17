'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Тип для настроек домашней страницы
type HomeSettings = {
  title: string
  subtitle: string
  backgroundImageUrl: string
  feature1Title: string
  feature1Text: string
  feature1Icon: string
  feature2Title: string
  feature2Text: string
  feature2Icon: string
  feature3Title: string
  feature3Text: string
  feature3Icon: string
}

type HomeSettingsContextType = {
  homeSettings: HomeSettings
  updateHomeSettings: (newSettings: Partial<HomeSettings>) => Promise<void>
  loading: boolean
  error: string | null
}

const defaultHomeSettings: HomeSettings = {
  title: "Комфортные трансферы из Калининграда в Европу",
  subtitle: "Безопасные и удобные поездки в города Польши, Германии, Литвы и других стран Европы",
  backgroundImageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  feature1Title: "Любые направления",
  feature1Text: "Поездки в основные города Европы по фиксированным ценам",
  feature1Icon: "MapPin",
  feature2Title: "Круглосуточно",
  feature2Text: "Работаем 24/7, включая праздники и выходные дни",
  feature2Icon: "Clock",
  feature3Title: "Гарантия качества",
  feature3Text: "Комфортные автомобили и опытные водители",
  feature3Icon: "Check"
}

const HomeSettingsContext = createContext<HomeSettingsContextType | undefined>(undefined)

export function HomeSettingsProvider({ children }: { children: ReactNode }) {
  const [homeSettings, setHomeSettings] = useState<HomeSettings>(defaultHomeSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Загружаем настройки при первой загрузке
    const loadHomeSettings = async () => {
      try {
        const response = await fetch('/api/home')
        const data = await response.json()

        if (data.homeSettings) {
          setHomeSettings({
            title: data.homeSettings.title || defaultHomeSettings.title,
            subtitle: data.homeSettings.subtitle || defaultHomeSettings.subtitle,
            backgroundImageUrl: data.homeSettings.backgroundImageUrl || defaultHomeSettings.backgroundImageUrl,
            feature1Title: data.homeSettings.feature1Title || defaultHomeSettings.feature1Title,
            feature1Text: data.homeSettings.feature1Text || defaultHomeSettings.feature1Text,
            feature1Icon: data.homeSettings.feature1Icon || defaultHomeSettings.feature1Icon,
            feature2Title: data.homeSettings.feature2Title || defaultHomeSettings.feature2Title,
            feature2Text: data.homeSettings.feature2Text || defaultHomeSettings.feature2Text,
            feature2Icon: data.homeSettings.feature2Icon || defaultHomeSettings.feature2Icon,
            feature3Title: data.homeSettings.feature3Title || defaultHomeSettings.feature3Title,
            feature3Text: data.homeSettings.feature3Text || defaultHomeSettings.feature3Text,
            feature3Icon: data.homeSettings.feature3Icon || defaultHomeSettings.feature3Icon,
          })
        }
      } catch (err) {
        console.error('Ошибка при загрузке настроек домашней страницы:', err)
        setError('Не удалось загрузить настройки домашней страницы')
      } finally {
        setLoading(false)
      }
    }

    loadHomeSettings()
  }, [])

  const updateHomeSettings = async (newSettings: Partial<HomeSettings>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/home', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось обновить настройки домашней страницы')
      }

      // Обновляем только полученные поля, сохраняя остальные
      setHomeSettings(prevSettings => ({
        ...prevSettings,
        ...data.homeSettings
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(errorMessage)
      console.error('Ошибка при обновлении настроек домашней страницы:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <HomeSettingsContext.Provider value={{ homeSettings, updateHomeSettings, loading, error }}>
      {children}
    </HomeSettingsContext.Provider>
  )
}

export function useHomeSettings() {
  const context = useContext(HomeSettingsContext)
  if (context === undefined) {
    throw new Error('useHomeSettings должен использоваться внутри HomeSettingsProvider')
  }
  return context
}
