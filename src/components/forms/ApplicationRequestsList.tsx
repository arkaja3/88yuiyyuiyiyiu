'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, CheckCircle, PhoneCall, RefreshCw, MessageCircle } from 'lucide-react'

// Типы для заявок
type ApplicationRequest = {
  id: number
  name: string
  phone: string
  contactMethod: string
  status: string
  createdAt: string
  updatedAt: string
}

// Функция для форматирования даты и времени
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('ru', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export default function ApplicationRequestsList() {
  const [requests, setRequests] = useState<ApplicationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Функция для загрузки заявок
  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/application-requests')
      if (!response.ok) {
        throw new Error('Не удалось загрузить заявки')
      }

      const data = await response.json()
      setRequests(data.requests || [])
    } catch (err) {
      console.error('Error fetching application requests:', err)
      setError('Ошибка при загрузке заявок')
    } finally {
      setLoading(false)
    }
  }

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchRequests()
  }, [])

  // Обработчик удаления заявки
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) {
      return
    }

    try {
      const response = await fetch(`/api/application-requests?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Не удалось удалить заявку')
      }

      toast.success('Заявка успешно удалена')
      setRequests(requests.filter(req => req.id !== id))
    } catch (err) {
      console.error('Error deleting application request:', err)
      toast.error('Ошибка при удалении заявки')
    }
  }

  // Обработчик обновления статуса заявки
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/application-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      })

      if (!response.ok) {
        throw new Error('Не удалось обновить статус заявки')
      }

      toast.success('Статус заявки обновлен')

      // Обновляем список заявок
      setRequests(requests.map(req =>
        req.id === id ? { ...req, status } : req
      ))
    } catch (err) {
      console.error('Error updating application request status:', err)
      toast.error('Ошибка при обновлении статуса заявки')
    }
  }

  // Получаем иконку для способа связи
  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'telegram':
        return (
          <div className="flex items-center">
            <svg className="h-4 w-4 text-blue-500 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 2c5.525 0 10 4.475 10 10s-4.475 10-10 10S2 17.525 2 12 6.475 2 12 2zm2.807 14.05l-.556-2.665-4.95 2.647 5.451-5.088-3.396-2.416 4.95-2.647-5.451 5.088 3.952 5.081z"/>
            </svg>
            <span>Telegram</span>
          </div>
        )
      case 'whatsapp':
        return (
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.72.045.477-.096.881zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
            </svg>
            <span>WhatsApp</span>
          </div>
        )
      case 'call':
        return (
          <div className="flex items-center">
            <PhoneCall className="h-4 w-4 text-red-500 mr-1" />
            <span>Звонок</span>
          </div>
        )
      default:
        return <span>{method}</span>
    }
  }

  // Получаем иконку для статуса заявки
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Новая</span>
      case 'in-progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">В работе</span>
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Завершена</span>
      case 'canceled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Отменена</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Заявки с формы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-xl font-bold">Заявки с формы</CardTitle>
        <Button
          variant="outline"
          onClick={fetchRequests}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Обновить
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <MessageCircle className="mx-auto h-10 w-10 mb-4 text-gray-400" />
            <p>Нет заявок</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата и время</TableHead>
                  <TableHead>Имя</TableHead>
                  <TableHead>Телефон</TableHead>
                  <TableHead>Контакт</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(req.createdAt)}
                    </TableCell>
                    <TableCell>{req.name}</TableCell>
                    <TableCell>
                      <a href={`tel:${req.phone}`} className="text-blue-600 hover:underline">
                        {req.phone}
                      </a>
                    </TableCell>
                    <TableCell>
                      {getContactMethodIcon(req.contactMethod)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(req.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {req.status !== 'in-progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(req.id, 'in-progress')}
                            className="h-8 px-2 text-yellow-600"
                          >
                            В работе
                          </Button>
                        )}
                        {req.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(req.id, 'completed')}
                            className="h-8 px-2 text-green-600"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(req.id)}
                          className="h-8 px-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
