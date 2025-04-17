'use client'

import { useState, useEffect } from 'react'
import { FileUpload } from '@/components/ui/file-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { normalizeImagePath } from '@/lib/utils'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface FileInfo {
  path: string
  size: number
  created: string
  modified: string
}

interface EnvironmentInfo {
  nodeEnv: string
  baseUrl: string
  appUrl: string
  cwd: string
  uploadsDir: string
}

export default function TestUploadsPage() {
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [files, setFiles] = useState<FileInfo[]>([])
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [folder, setFolder] = useState('uploads/reviews')

  // Загрузка списка файлов
  const fetchFiles = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/test-uploads?folder=${encodeURIComponent(folder)}`)

      if (!response.ok) {
        throw new Error('Не удалось получить список файлов')
      }

      const data = await response.json()
      setFiles(data.files)
      setEnvironment(data.environment)
    } catch (err) {
      console.error('Ошибка загрузки файлов:', err)
      setError('Не удалось загрузить список файлов')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [folder])

  // Обработчик загрузки файла
  const handleUploadComplete = (url: string) => {
    setUploadedUrl(url)
    // Обновляем список файлов после успешной загрузки
    setTimeout(fetchFiles, 1000)
  }

  // Форматирование размера файла
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Тестирование загрузки файлов</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Тестовая загрузка</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Папка для загрузки</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                >
                  <option value="uploads/reviews">Отзывы</option>
                  <option value="uploads/blog">Блог</option>
                  <option value="uploads/gallery">Галерея</option>
                </select>
              </div>

              <FileUpload
                folder={folder}
                onUploadComplete={handleUploadComplete}
                buttonLabel="Тестовая загрузка файла"
              />

              {uploadedUrl && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold">Загруженное изображение</h3>

                  <div className="p-3 bg-gray-50 rounded border overflow-auto">
                    <p className="text-sm mb-2">Оригинальный URL:</p>
                    <code className="block p-2 bg-gray-100 text-sm">{uploadedUrl}</code>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border overflow-auto">
                    <p className="text-sm mb-2">Нормализованный URL:</p>
                    <code className="block p-2 bg-gray-100 text-sm">{normalizeImagePath(uploadedUrl)}</code>
                  </div>

                  <div className="p-3 bg-gray-50 rounded border">
                    <p className="text-sm mb-2">Предпросмотр изображения:</p>
                    <img
                      src={normalizeImagePath(uploadedUrl)}
                      alt="Загруженное изображение"
                      className="max-w-full h-auto max-h-56 mt-2 border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.border = '2px solid red'
                        const errorMsg = document.createElement('p')
                        errorMsg.className = 'text-red-500 text-sm mt-2'
                        errorMsg.textContent = 'Ошибка загрузки изображения! Проверьте консоль.'
                        e.currentTarget.parentNode?.appendChild(errorMsg)
                        console.error('Ошибка загрузки изображения:', normalizeImagePath(uploadedUrl))
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Информация о системе</h2>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded border">
                  <h3 className="font-semibold mb-2">Переменные окружения</h3>
                  {loading ? (
                    <p>Загрузка...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : environment ? (
                    <div className="space-y-2">
                      <p><strong>NODE_ENV:</strong> {environment.nodeEnv}</p>
                      <p><strong>BASE_URL:</strong> {environment.baseUrl || 'не задан'}</p>
                      <p><strong>APP_URL:</strong> {environment.appUrl || 'не задан'}</p>
                      <p><strong>CWD:</strong> {environment.cwd}</p>
                      <p><strong>Директория загрузок:</strong> {environment.uploadsDir}</p>
                    </div>
                  ) : (
                    <p>Нет данных</p>
                  )}
                </div>

                <div className="p-3 bg-gray-50 rounded border">
                  <h3 className="font-semibold mb-2">Файлы в директории {folder}</h3>
                  {loading ? (
                    <p>Загрузка...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : files.length > 0 ? (
                    <div className="overflow-auto max-h-80">
                      <table className="min-w-full border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 border">Файл</th>
                            <th className="p-2 border">Размер</th>
                            <th className="p-2 border">Действие</th>
                          </tr>
                        </thead>
                        <tbody>
                          {files.map((file, index) => (
                            <tr key={index} className="border">
                              <td className="p-2 border">{file.path}</td>
                              <td className="p-2 border text-center">{formatFileSize(file.size)}</td>
                              <td className="p-2 border text-center">
                                <a
                                  href={normalizeImagePath(file.path)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Просмотр
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>Файлы не найдены</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={fetchFiles} className="mr-2">
              Обновить данные
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
