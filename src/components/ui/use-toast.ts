// useToast.ts
import { useState } from 'react'

type ToastVariant = 'default' | 'destructive'

interface ToastProps {
  title: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    // В реальном приложении здесь будет логика для отображения уведомлений
    console.log('Toast:', props.title, props.description, props.variant)
  }

  return { toast }
}
