'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlusCircle, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import BlogPostForm from '@/components/forms/BlogPostForm'

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

export default function BlogPostList() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [currentPost, setCurrentPost] = useState<BlogPost | undefined>(undefined)
  const [isCreating, setIsCreating] = useState(false)

  // Загрузка списка статей
  const fetchBlogPosts = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/blog')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось загрузить статьи')
      }

      setBlogPosts(data.blogPosts)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      setError(error instanceof Error ? error.message : 'Произошла ошибка при загрузке')
      toast.error('Не удалось загрузить статьи блога')
    } finally {
      setIsLoading(false)
    }
  }

  // Загружаем статьи при монтировании компонента
  useEffect(() => {
    fetchBlogPosts()
  }, [])

  // Функция создания новой статьи
  const handleCreate = () => {
    setCurrentPost(undefined)
    setIsCreating(true)
    setShowDialog(true)
  }

  // Функция редактирования статьи
  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post)
    setIsCreating(false)
    setShowDialog(true)
  }

  // Функция удаления статьи
  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Вы уверены, что хотите удалить статью "${post.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/blog?id=${post.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось удалить статью')
      }

      toast.success('Статья успешно удалена')
      fetchBlogPosts() // Обновляем список после удаления
    } catch (error) {
      console.error('Error deleting blog post:', error)
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка при удалении')
    }
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указана'

    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Управление статьями блога</h2>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Новая статья
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-md bg-red-50 text-red-700">
          {error}
        </div>
      ) : blogPosts.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-gray-500 mb-4">Нет созданных статей</p>
          <Button onClick={handleCreate} variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать первую статью
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заголовок
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogPosts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {post.imageUrl ? (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <div
                              className="h-10 w-10 rounded-md bg-cover bg-center"
                              style={{ backgroundImage: `url(${post.imageUrl})` }}
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md mr-3" />
                        )}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {post.excerpt}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${post.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        {post.isPublished ? (
                          <><Eye className="w-3 h-3 mr-1" /> Опубликовано</>
                        ) : (
                          <><EyeOff className="w-3 h-3 mr-1" /> Черновик</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(post)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Редактировать</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-3xl p-0 max-h-screen overflow-auto">
          <BlogPostForm
            post={currentPost}
            onSubmitSuccess={() => {
              setShowDialog(false)
              fetchBlogPosts()
            }}
            onCancel={() => setShowDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
