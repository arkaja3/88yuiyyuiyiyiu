'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

type BlogPost = {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string
  imageUrl: string | null
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

type BlogPostFormProps = {
  post?: BlogPost
  onSubmitSuccess: () => void
  onCancel: () => void
}

export default function BlogPostForm({ post, onSubmitSuccess, onCancel }: BlogPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    imageUrl: post?.imageUrl || '',
    isPublished: post?.isPublished || false,
    customSlug: post?.slug || ''
  })
  const [generatedSlug, setGeneratedSlug] = useState('')
  const [useCustomSlug, setUseCustomSlug] = useState(!!post?.slug)

  // Генерация slug при изменении заголовка
  useEffect(() => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\sа-яё]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/[а-яё]/gi, c => {
          const translitMap: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
            'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          }
          return translitMap[c.toLowerCase()] || c
        })
        .slice(0, 50)

      setGeneratedSlug(slug)

      // Если не используется кастомный slug, обновить значение поля customSlug
      if (!useCustomSlug) {
        setFormData(prev => ({ ...prev, customSlug: slug }))
      }
    }
  }, [formData.title, useCustomSlug])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isPublished: checked }))
  }

  const handleCustomSlugCheckboxChange = (checked: boolean) => {
    setUseCustomSlug(checked)
    if (!checked) {
      setFormData(prev => ({ ...prev, customSlug: generatedSlug }))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Только латинские буквы, цифры и дефисы
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')

    setFormData(prev => ({ ...prev, customSlug: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Валидация
    if (!formData.title.trim()) {
      toast.error('Пожалуйста, укажите заголовок статьи')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Пожалуйста, добавьте содержание статьи')
      return
    }

    if (!formData.customSlug.trim()) {
      toast.error('URL статьи не может быть пустым')
      return
    }

    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()

      // Добавляем ID при обновлении существующего поста
      if (post?.id) {
        formDataObj.append('id', post.id.toString())
      }

      // Добавляем текстовые поля
      formDataObj.append('title', formData.title)
      formDataObj.append('content', formData.content)
      formDataObj.append('excerpt', formData.excerpt)
      formDataObj.append('isPublished', formData.isPublished.toString())
      formDataObj.append('slug', formData.customSlug)

      // Добавляем URL изображения, если он указан
      if (formData.imageUrl) {
        formDataObj.append('imageUrl', formData.imageUrl)
      }

      // Отправляем запрос на сервер
      const response = await fetch('/api/blog', {
        method: post ? 'PUT' : 'POST',
        body: formDataObj
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Произошла ошибка при сохранении')
      }

      toast.success(post ? 'Статья успешно обновлена' : 'Статья успешно создана')
      onSubmitSuccess()

    } catch (error) {
      console.error('Error submitting blog post:', error)
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка при сохранении')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{post ? 'Редактирование статьи' : 'Создание новой статьи'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 overflow-visible">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Заголовок статьи *
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Введите заголовок статьи"
              className="w-full"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700">
                URL страницы статьи *
              </label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useCustomSlug"
                  checked={useCustomSlug}
                  onCheckedChange={handleCustomSlugCheckboxChange}
                />
                <label
                  htmlFor="useCustomSlug"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Задать URL вручную
                </label>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">/blog/</span>
              <Input
                id="customSlug"
                name="customSlug"
                value={formData.customSlug}
                onChange={handleSlugChange}
                placeholder="url-stranicy"
                className="w-full"
                disabled={!useCustomSlug}
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {useCustomSlug
                ? 'Используйте только латинские буквы, цифры и дефисы.'
                : 'URL генерируется автоматически из заголовка.'}
            </p>
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Краткое описание (отображается в списке статей) *
            </label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Краткое описание статьи"
              className="w-full"
              rows={2}
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Содержание статьи *
            </label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Содержание статьи"
              className="w-full"
              rows={10}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Вы можете использовать HTML-теги для форматирования текста (например, &lt;strong&gt;, &lt;br&gt;, &lt;p&gt;).
            </p>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL изображения для статьи
            </label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Введите URL изображения (например, https://example.com/image.jpg)"
              className="w-full"
            />
            <p className="mt-1 text-sm text-gray-500">
              Рекомендуемый размер: 1200x630px
            </p>

            {formData.imageUrl && (
              <div className="mt-2">
                <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${formData.imageUrl})` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={handleCheckboxChange}
            />
            <label
              htmlFor="isPublished"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Опубликовать статью
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : post ? 'Обновить' : 'Создать'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
