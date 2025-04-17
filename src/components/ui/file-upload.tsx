'use client'

import { useState, useRef } from 'react'
import { UploadCloud, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadComplete: (fileUrl: string) => void
  folder: string
  className?: string
  accept?: string
  maxSizeMB?: number
  buttonLabel?: string
}

export function FileUpload({
  onUploadComplete,
  folder,
  className = '',
  accept = 'image/*',
  maxSizeMB = 5,
  buttonLabel = 'Загрузить изображение'
}: FileUploadProps) {
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

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Ошибка при загрузке файла')
      }

      const data = await response.json()
      setIsSuccess(true)

      // Добавляем проверку и нормализацию URL
      let fileUrl = data.fileUrl;
      // Проверяем, начинается ли URL с /, если нет - добавляем
      if (!fileUrl.startsWith('/')) {
        fileUrl = '/' + fileUrl;
      }

      console.log('Полученный URL:', fileUrl);
      onUploadComplete(fileUrl)
      toast.success('Файл успешно загружен')
    } catch (error) {
      console.error('Ошибка загрузки:', error)
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
              <span className="mt-2 text-sm">Загрузка...</span>
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

export function FileUploadItem({
  url,
  onRemove,
  className = ''
}: {
  url: string
  onRemove: () => void
  className?: string
}) {
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
