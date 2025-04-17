import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

// Константы для PostImage API
const POSTIMAGE_API_URL = 'https://postimage.me/api/1/upload'
const PUBLIC_API_KEY = '442c1196f61793728f933be13f35cba416756a1598c5f5e1f97a0316c24db0ae'

// Функция для сохранения файла
async function saveFile(
  file: File,
  folderPath: string
): Promise<string> {
  try {
    // Создаем уникальное имя файла с использованием UUID
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Получаем расширение файла из его типа
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `${uuidv4()}.${fileExtension}`

    // Полный путь к файлу
    const folderPathCleaned = folderPath.replace(/^\/+|\/+$/g, '')
    const fullPath = join(process.cwd(), 'public', folderPathCleaned, fileName)

    // Создаем директорию, если она не существует
    await mkdir(join(process.cwd(), 'public', folderPathCleaned), { recursive: true })

    // Записываем файл
    await writeFile(fullPath, buffer)
    console.log(`Файл успешно сохранен по пути: ${fullPath}`)

    // Возвращаем публичный URL для доступа к файлу
    return `/${folderPathCleaned}/${fileName}`
  } catch (error) {
    console.error('Ошибка при сохранении файла:', error)
    throw error
  }
}

// Функция для загрузки файла на PostImage API
async function uploadToPostImage(
  file: File,
  title?: string,
  description?: string,
  tags?: string
): Promise<string> {
  try {
    console.log('Начинаем загрузку на PostImage:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      title,
      tags
    })

    // Создаем FormData для отправки на PostImage
    const formData = new FormData()
    formData.append('source', file)
    formData.append('key', PUBLIC_API_KEY)
    formData.append('format', 'json')

    if (title) {
      formData.append('title', title)
    }

    if (description) {
      formData.append('description', description)
    }

    if (tags) {
      formData.append('tags', tags)
    }

    // Отправляем запрос на PostImage API
    const response = await fetch(POSTIMAGE_API_URL, {
      method: 'POST',
      headers: {
        'X-API-Key': PUBLIC_API_KEY,
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Парсим ответ
    const data = await response.json()
    console.log('Ответ от PostImage API:', data)

    if (data.status_code !== 200 || !data.image) {
      throw new Error(data.error?.message || 'Неизвестная ошибка при загрузке изображения')
    }

    // Возвращаем URL загруженного изображения
    return data.image.url
  } catch (error) {
    console.error('Ошибка при загрузке изображения на PostImage:', error)
    throw error
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string | null
    const usePostImage = formData.get('usePostImage') === 'true'

    // Получаем дополнительные параметры для PostImage
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const tags = formData.get('tags') as string | null

    console.log('Получен запрос на загрузку:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      folder,
      usePostImage,
      title,
      tags
    })

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 })
    }

    // Если указано использовать PostImage
    if (usePostImage) {
      try {
        const imageUrl = await uploadToPostImage(file, title || undefined, description || undefined, tags || undefined)
        console.log('Файл успешно загружен на PostImage:', imageUrl)
        return NextResponse.json({ url: imageUrl })
      } catch (error) {
        console.error('Ошибка при загрузке на PostImage, переключаемся на локальное хранилище:', error)
        // Если произошла ошибка при загрузке на PostImage, сохраняем файл локально
        // продолжаем выполнение и загружаем файл локально
      }
    }

    let targetFolder = folder

    // Если не указан параметр folder, используем папку по умолчанию для загрузки
    if (!targetFolder) {
      targetFolder = 'uploads/reviews'
    }

    // Проверка на допустимые папки для загрузки
    const allowedFolders = ['uploads/reviews', 'uploads/blog', 'uploads/gallery']

    if (!allowedFolders.includes(targetFolder)) {
      return NextResponse.json(
        { error: `Недопустимая папка для загрузки: ${targetFolder}. Разрешенные папки: ${allowedFolders.join(', ')}` },
        { status: 400 }
      )
    }

    // Сохраняем файл и получаем URL
    const fileUrl = await saveFile(file, targetFolder)
    console.log('Файл успешно сохранен локально:', fileUrl)

    return NextResponse.json({ url: fileUrl })
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error)
    return NextResponse.json(
      { error: `Не удалось загрузить файл: ${(error as Error).message}` },
      { status: 500 }
    )
  }
}
