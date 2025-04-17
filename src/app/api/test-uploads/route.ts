import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

// Функция для сканирования директории
async function scanDirectory(dirPath: string, basePath = '') {
  try {
    const items = await readdir(dirPath)
    const result = []

    for (const item of items) {
      const fullPath = join(dirPath, item)
      const relativePath = join(basePath, item)
      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        const subDirItems = await scanDirectory(fullPath, relativePath)
        result.push(...subDirItems)
      } else {
        result.push({
          path: relativePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        })
      }
    }

    return result
  } catch (error) {
    console.error('Ошибка сканирования директории:', error)
    return []
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const folder = url.searchParams.get('folder') || 'uploads'

    // Сканируем директорию
    const uploadsDir = join(process.cwd(), 'public', folder)
    const files = await scanDirectory(uploadsDir)

    // Собираем информацию об окружении
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      cwd: process.cwd(),
      uploadsDir
    }

    return NextResponse.json({
      environment,
      files,
      count: files.length
    })
  } catch (error) {
    console.error('Ошибка тестирования загрузок:', error)
    return NextResponse.json(
      { error: 'Ошибка при сканировании директории' },
      { status: 500 }
    )
  }
}
