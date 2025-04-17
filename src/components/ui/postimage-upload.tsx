'use client'

import { useState, useRef } from 'react'
import { UploadCloud, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { postImageService } from '@/lib/postimage-service'

interface PostImageUploadProps {
  onUploadComplete: (fileUrl: string) => void
  className?: string
  accept?: string
  maxSizeMB?: number
  buttonLabel?: string
  tags?: string[]
  description?: string
  title?: string
}

export function PostImageUpload({
  onUploadComplete,
  className = '',
  accept = 'image/*',
  maxSizeMB = 5,
  buttonLabel = 'Загрузить изображение',
  tags = [],
  description = '',
  title = ''
}: PostImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка размера файла
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`Размер файла превышает ${maxSizeMB}MB`)
      return
    }

    // Предпросмотр изображения
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    try {
      setIsUploading(true)
      setIsSuccess(false)

      // Создаем FormData для отправки на наш сервер
      const formData = new FormData()
      formData.append('file', file)
      formData.append('usePostImage', 'true') // Указываем, что нужно использовать PostImage
      formData.append('title', title || file.name)

      if (description) {
        formData.append('description', description)
      }

      if (tags && tags.length > 0) {
        formData.append('tags', tags.join(','))
      }

      // Отправляем запрос на наш прокси API
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.url) {
        throw new Error('Не удалось получить URL загруженного изображения')
      }

      console.log('Изображение успешно загружено через наш сервер:', data.url)
      setIsSuccess(true)
      onUploadComplete(data.url)
      toast.success('Файл успешно загружен')
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      toast.error('Не удалось загрузить файл')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const clearUpload = () => {
    setPreview(null)
    setIsSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />

      {!preview ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={isUploading}
          className="w-full border-dashed h-32 flex flex-col items-center justify-center space-y-2"
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              <span className="mt-2 text-sm">Загрузка на PostImage...</span>
            </div>
          ) : (
            <>
              <UploadCloud className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-600">{buttonLabel}</span>
              <span className="text-xs text-gray-400">
                Максимальный размер: {maxSizeMB}MB
              </span>
            </>
          )}
        </Button>
      ) : (
        <div className="relative border rounded-md overflow-hidden">
          <div className="absolute top-2 right-2 z-10 flex space-x-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={clearUpload}
            >
              <X className="h-4 w-4" />
            </Button>
            {isSuccess && (
              <div className="bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>

          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 object-cover"
          />
        </div>
      )}
    </div>
  )
}

interface PostImageUploadItemProps {
  url: string
  onRemove: () => void
  className?: string
}

export function PostImageUploadItem({
  url,
  onRemove,
  className = ''
}: PostImageUploadItemProps) {
  return (
    <div className={`relative border rounded-md overflow-hidden ${className}`}>
      <div className="absolute top-2 right-2 z-10">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-6 w-6 rounded-full"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {url && (
        <div className="w-full h-32">
          <img
            src={url}
            alt="Uploaded file"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Показать плейсхолдер, если изображение не загрузилось
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgbG9hZCBlcnJvcjwvdGV4dD48L3N2Zz4=';
            }}
          />
        </div>
      )}
    </div>
  )
}
