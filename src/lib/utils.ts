import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Утилиты для работы с классами
export function combineClasses(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function conditionalClass(condition: boolean, className: string) {
  return condition ? className : ''
}

/**
 * Нормализует путь к изображению, обрабатывая относительные пути и URL
 * @param path Путь к изображению, может быть null
 * @returns Нормализованный путь или путь по умолчанию, если path равен null
 */
export function normalizeImagePath(path: string | null, defaultPath: string = ''): string {
  if (!path) return defaultPath;

  // Если путь уже абсолютный URL (начинается с http:// или https://)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Если путь начинается с /uploads/, оставляем как есть
  if (path.startsWith('/uploads/')) {
    return path;
  }

  // Если путь относительный (начинается с /)
  if (path.startsWith('/')) {
    return path;
  }

  // Если путь не начинается с /, добавляем / в начало
  return `/${path}`;
}

/**
 * Форматирует дату в указанный формат
 * @param date Дата для форматирования
 * @param formatStr Строка формата
 * @returns Отформатированная дата
 */
export function formatDate(date: Date | string, formatStr: string = 'dd.MM.yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: ru });
}
