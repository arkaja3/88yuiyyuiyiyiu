'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Типы для заявок из формы обратной связи
interface ContactRequest {
  id: number
  name: string | null
  email: string | null
  phone: string | null
  message: string
  status: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function ContactRequestsList() {
  // Состояния для списка заявок и пагинации
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  })

  // Состояния для фильтрации и управления
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('new')

  // Состояния для модальных окон
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<ContactRequest | null>(null)
  const [editFormData, setEditFormData] = useState({
    status: '',
    response: ''
  })

  // Загрузка заявок при изменении статуса или страницы
  useEffect(() => {
    fetchContactRequests()
  }, [pagination.page, activeTab])

  // Функция загрузки заявок
  const fetchContactRequests = async () => {
    setLoading(true)
    try {
      const statusParam = activeTab !== 'all' ? `status=${activeTab}` : ''
      const response = await fetch(`/api/contact-requests?page=${pagination.page}&limit=${pagination.limit}&${statusParam}`)
      const data = await response.json()

      if (data.contactRequests) {
        setContactRequests(data.contactRequests)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Ошибка при загрузке заявок:', error)
      toast.error('Не удалось загрузить заявки из формы обратной связи')
    } finally {
      setLoading(false)
    }
  }

  // Функция обработки изменения статуса
  const handleStatusChange = (tab: string) => {
    setActiveTab(tab)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Открытие модального окна для редактирования
  const handleEditRequest = (request: ContactRequest) => {
    setCurrentRequest(request)
    setEditFormData({
      status: request.status,
      response: ''
    })
    setOpenEditDialog(true)
  }

  // Обновление заявки
  const handleUpdateRequest = async () => {
    if (!currentRequest) return

    try {
      const response = await fetch('/api/contact-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentRequest.id,
          status: editFormData.status
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении заявки')
      }

      toast.success('Заявка успешно обновлена')
      setOpenEditDialog(false)
      fetchContactRequests()
    } catch (error) {
      console.error('Ошибка при обновлении заявки:', error)
      toast.error('Не удалось обновить заявку')
    }
  }

  // Удаление заявки
  const handleDeleteRequest = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return

    try {
      const response = await fetch(`/api/contact-requests?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при удалении заявки')
      }

      toast.success('Заявка успешно удалена')
      fetchContactRequests()
    } catch (error) {
      console.error('Ошибка при удалении заявки:', error)
      toast.error('Не удалось удалить заявку')
    }
  }

  // Функция форматирования даты
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указана'
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: ru })
    } catch (e) {
      return dateString
    }
  }

  // Функция получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Функция получения названия статуса
  const getStatusName = (status: string) => {
    switch (status) {
      case 'new': return 'Новая'
      case 'processing': return 'В обработке'
      case 'completed': return 'Выполнена'
      default: return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заявки из формы обратной связи</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Табы для фильтрации по статусу */}
        <Tabs value={activeTab} onValueChange={handleStatusChange} className="w-full mb-6">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="new">Новые</TabsTrigger>
            <TabsTrigger value="processing">В обработке</TabsTrigger>
            <TabsTrigger value="completed">Выполненные</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Загрузка или пустой список */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : contactRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Нет заявок с выбранным статусом</p>
          </div>
        ) : (
          /* Таблица с заявками */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left font-medium">ID</th>
                  <th className="p-2 text-left font-medium">Дата заявки</th>
                  <th className="p-2 text-left font-medium">Контактная информация</th>
                  <th className="p-2 text-left font-medium">Сообщение</th>
                  <th className="p-2 text-left font-medium">Статус</th>
                  <th className="p-2 text-left font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {contactRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-200">
                    <td className="p-2">{request.id}</td>
                    <td className="p-2">{formatDate(request.createdAt)}</td>
                    <td className="p-2">
                      {request.name && <div>{request.name}</div>}
                      {request.email && <div className="text-sm text-gray-500">{request.email}</div>}
                      {request.phone && <div className="text-sm text-gray-500">{request.phone}</div>}
                    </td>
                    <td className="p-2">
                      <div className="max-w-xs truncate">{request.message}</div>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                        {getStatusName(request.status)}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRequest(request)}
                        >
                          Детали
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id)}
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Пагинация */}
        {pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Всего: {pagination.total} записей
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Назад
              </Button>
              <div className="flex items-center">
                <span className="text-sm">
                  Страница {pagination.page} из {pagination.pages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Вперед
              </Button>
            </div>
          </div>
        )}

        {/* Модальное окно для просмотра и редактирования заявки */}
        <Dialog
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Детали обращения #{currentRequest?.id}</DialogTitle>
            </DialogHeader>

            {currentRequest && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Дата обращения</h4>
                  <p>{formatDate(currentRequest.createdAt)}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Контактная информация</h4>
                  {currentRequest.name && <p>Имя: {currentRequest.name}</p>}
                  {currentRequest.email && <p>Email: {currentRequest.email}</p>}
                  {currentRequest.phone && <p>Телефон: {currentRequest.phone}</p>}
                </div>

                <div>
                  <h4 className="text-sm font-medium">Сообщение</h4>
                  <p className="text-sm whitespace-pre-wrap">{currentRequest.message}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Статус обращения</label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Новая</SelectItem>
                      <SelectItem value="processing">В обработке</SelectItem>
                      <SelectItem value="completed">Выполнена</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Ответ клиенту</label>
                  <Textarea
                    value={editFormData.response}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, response: e.target.value }))}
                    placeholder="Напишите ответ клиенту"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ответ будет отправлен на указанный email (если предоставлен)
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenEditDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleUpdateRequest}>
                Сохранить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
