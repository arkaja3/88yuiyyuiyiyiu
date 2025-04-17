'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Типы для заявок на трансфер
interface TransferRequest {
  id: number
  customerName: string
  customerPhone: string
  vehicleClass: string
  date: string
  time: string
  originCity: string
  originAddress: string
  destinationCity: string
  destinationAddress: string | null
  tellDriver: boolean
  paymentMethod: string
  returnTransfer: boolean
  returnDate: string | null
  returnTime: string | null
  comments: string | null
  status: string
  createdAt: string
  updatedAt: string
  vehicleId: number | null
  vehicle?: {
    id: number
    class: string
    brand: string
    model: string
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function TransferRequestsList() {
  // Состояния для списка заявок и пагинации
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  })

  // Состояния для фильтрации и управления
  const [status, setStatus] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('new')

  // Состояния для модальных окон
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<TransferRequest | null>(null)
  const [editFormData, setEditFormData] = useState({
    status: '',
    comments: ''
  })

  // Загрузка заявок при изменении статуса или страницы
  useEffect(() => {
    fetchTransferRequests()
  }, [pagination.page, activeTab])

  // Функция загрузки заявок
  const fetchTransferRequests = async () => {
    setLoading(true)
    try {
      const statusParam = activeTab !== 'all' ? `status=${activeTab}` : ''
      const response = await fetch(`/api/transfer-requests?page=${pagination.page}&limit=${pagination.limit}&${statusParam}`)
      const data = await response.json()

      if (data.transferRequests) {
        setTransferRequests(data.transferRequests)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Ошибка при загрузке заявок:', error)
      toast.error('Не удалось загрузить заявки на трансфер')
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
  const handleEditRequest = (request: TransferRequest) => {
    setCurrentRequest(request)
    setEditFormData({
      status: request.status,
      comments: request.comments || ''
    })
    setOpenEditDialog(true)
  }

  // Обновление заявки
  const handleUpdateRequest = async () => {
    if (!currentRequest) return

    try {
      const response = await fetch('/api/transfer-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentRequest.id,
          status: editFormData.status,
          comments: editFormData.comments
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении заявки')
      }

      toast.success('Заявка успешно обновлена')
      setOpenEditDialog(false)
      fetchTransferRequests()
    } catch (error) {
      console.error('Ошибка при обновлении заявки:', error)
      toast.error('Не удалось обновить заявку')
    }
  }

  // Удаление заявки
  const handleDeleteRequest = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return

    try {
      const response = await fetch(`/api/transfer-requests?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при удалении заявки')
      }

      toast.success('Заявка успешно удалена')
      fetchTransferRequests()
    } catch (error) {
      console.error('Ошибка при удалении заявки:', error)
      toast.error('Не удалось удалить заявку')
    }
  }

  // Функция форматирования даты
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указана'
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru })
    } catch (e) {
      return dateString
    }
  }

  // Функция получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'canceled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Функция получения названия статуса
  const getStatusName = (status: string) => {
    switch (status) {
      case 'new': return 'Новая'
      case 'processing': return 'В обработке'
      case 'confirmed': return 'Подтверждена'
      case 'completed': return 'Выполнена'
      case 'canceled': return 'Отменена'
      default: return status
    }
  }

  // Функция получения названия метода оплаты
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Наличные'
      case 'card': return 'Банковская карта'
      case 'online': return 'Онлайн-платеж'
      default: return method
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Заявки на трансфер</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Табы для фильтрации по статусу */}
        <Tabs value={activeTab} onValueChange={handleStatusChange} className="w-full mb-6">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="new">Новые</TabsTrigger>
            <TabsTrigger value="processing">В обработке</TabsTrigger>
            <TabsTrigger value="confirmed">Подтвержденные</TabsTrigger>
            <TabsTrigger value="completed">Выполненные</TabsTrigger>
            <TabsTrigger value="canceled">Отмененные</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Загрузка или пустой список */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : transferRequests.length === 0 ? (
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
                  <th className="p-2 text-left font-medium">Клиент</th>
                  <th className="p-2 text-left font-medium">Маршрут</th>
                  <th className="p-2 text-left font-medium">Дата поездки</th>
                  <th className="p-2 text-left font-medium">Статус</th>
                  <th className="p-2 text-left font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {transferRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-200">
                    <td className="p-2">{request.id}</td>
                    <td className="p-2">{formatDate(request.createdAt)}</td>
                    <td className="p-2">
                      <div>{request.customerName}</div>
                      <div className="text-sm text-gray-500">{request.customerPhone}</div>
                    </td>
                    <td className="p-2">
                      <div>{request.originCity} → {request.destinationCity}</div>
                      <div className="text-sm text-gray-500">{request.vehicleClass}</div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(request.date)}
                      </div>
                      <div className="text-sm text-gray-500">{request.time}</div>
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

        {/* Модальное окно для редактирования заявки */}
        <Dialog
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Детали заявки #{currentRequest?.id}</DialogTitle>
            </DialogHeader>

            {currentRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Клиент</h4>
                    <p>{currentRequest.customerName}</p>
                    <p className="text-sm text-gray-500">{currentRequest.customerPhone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Дата создания</h4>
                    <p>{formatDate(currentRequest.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium">Маршрут</h4>
                  <p>{currentRequest.originCity} → {currentRequest.destinationCity}</p>
                  <p className="text-sm text-gray-500">От: {currentRequest.originAddress}</p>
                  {!currentRequest.tellDriver && currentRequest.destinationAddress && (
                    <p className="text-sm text-gray-500">До: {currentRequest.destinationAddress}</p>
                  )}
                  {currentRequest.tellDriver && (
                    <p className="text-sm text-gray-500">Точный адрес прибытия будет указан водителю</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Дата поездки</h4>
                    <p>{formatDate(currentRequest.date)}</p>
                    <p className="text-sm text-gray-500">Время: {currentRequest.time}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Способ оплаты</h4>
                    <p>{getPaymentMethodName(currentRequest.paymentMethod)}</p>
                  </div>
                </div>

                {currentRequest.returnTransfer && (
                  <div>
                    <h4 className="text-sm font-medium">Обратный трансфер</h4>
                    {currentRequest.returnDate && (
                      <p>Дата: {formatDate(currentRequest.returnDate)}</p>
                    )}
                    {currentRequest.returnTime && (
                      <p className="text-sm text-gray-500">Время: {currentRequest.returnTime}</p>
                    )}
                  </div>
                )}

                {currentRequest.comments && (
                  <div>
                    <h4 className="text-sm font-medium">Комментарий клиента</h4>
                    <p className="text-sm">{currentRequest.comments}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Статус заявки</label>
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
                      <SelectItem value="confirmed">Подтверждена</SelectItem>
                      <SelectItem value="completed">Выполнена</SelectItem>
                      <SelectItem value="canceled">Отменена</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Комментарий к заявке</label>
                  <Textarea
                    value={editFormData.comments}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Добавьте комментарий к заявке"
                    rows={3}
                  />
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
