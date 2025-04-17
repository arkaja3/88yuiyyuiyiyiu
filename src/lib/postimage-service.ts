import { toast } from 'sonner';

// Публичный API ключ PostImage (можно использовать для тестирования)
const PUBLIC_API_KEY = '442c1196f61793728f933be13f35cba416756a1598c5f5e1f97a0316c24db0ae';

// URL для API запросов
const API_URL = 'https://postimage.me/api/1/upload';

/**
 * Интерфейс для ответа от PostImage API
 */
interface PostImageResponse {
  status_code: number;
  status_txt: string;
  success?: {
    message: string;
    code: number;
  };
  image?: {
    url: string;
    url_viewer: string;
    thumb: {
      url: string;
    };
    display_url: string;
    delete_url: string;
  };
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Опции для загрузки изображения
 */
interface UploadOptions {
  title?: string;
  description?: string;
  tags?: string[];
  expiration?: string; // Формат: PT5M (5 минут), P3D (3 дня)
  nsfw?: boolean;
  apiKey?: string; // Кастомный API ключ, если не хотите использовать публичный
}

/**
 * Класс для работы с PostImage API
 */
export class PostImageService {
  private apiKey: string;
  private useProxy: boolean;

  constructor(apiKey: string = PUBLIC_API_KEY, useProxy: boolean = true) {
    this.apiKey = apiKey;
    this.useProxy = useProxy;
  }

  /**
   * Загрузка файла на PostImage
   * @param file Файл для загрузки
   * @param options Опции загрузки
   * @returns Promise с URL загруженного изображения
   */
  async uploadFile(file: File, options: UploadOptions = {}): Promise<string> {
    try {
      // Проверяем, использовать ли прокси
      if (this.useProxy) {
        // Загружаем файл через наш серверный API
        const formData = new FormData();
        formData.append('file', file);

        if (options.title) {
          formData.append('title', options.title);
        }

        if (options.description) {
          formData.append('description', options.description);
        }

        if (options.tags && options.tags.length > 0) {
          formData.append('tags', options.tags.join(','));
        }

        // Отправляем запрос на наш API
        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.url) {
          throw new Error('Не удалось получить URL загруженного изображения');
        }

        return data.url;
      } else {
        // Прямой запрос к PostImage API (оригинальный код)
        const formData = new FormData();
        formData.append('source', file);
        formData.append('key', options.apiKey || this.apiKey);

        if (options.title) {
          formData.append('title', options.title);
        }

        if (options.description) {
          formData.append('description', options.description);
        }

        if (options.tags && options.tags.length > 0) {
          formData.append('tags', options.tags.join(','));
        }

        if (options.expiration) {
          formData.append('expiration', options.expiration);
        }

        if (options.nsfw !== undefined) {
          formData.append('nsfw', options.nsfw ? '1' : '0');
        }

        // Указываем формат ответа JSON
        formData.append('format', 'json');

        // Добавляем режим 'no-cors' для обхода CORS ограничений
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'X-API-Key': options.apiKey || this.apiKey,
          },
          body: formData,
          mode: 'no-cors' // Пытаемся использовать режим no-cors
        });

        // В режиме no-cors ответ может быть "opaque" и мы не сможем получить его содержимое
        // Поэтому возвращаем заглушку или пустую строку
        // Важно: этот подход имеет ограничения, так как мы не можем получить реальный ответ
        return ''; // Это будет заменено прокси подходом
      }
    } catch (error) {
      console.error('Ошибка при загрузке изображения на PostImage:', error);
      throw error;
    }
  }

  /**
   * Загрузка файла из Base64 строки
   * @param base64Data Base64 строка с данными изображения
   * @param filename Имя файла
   * @param mimeType MIME тип файла
   * @param options Опции загрузки
   * @returns Promise с URL загруженного изображения
   */
  async uploadBase64(
    base64Data: string,
    filename: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<string> {
    try {
      // Конвертируем Base64 в Blob
      const byteString = atob(base64Data.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeType });
      const file = new File([blob], filename, { type: mimeType });

      // Используем метод uploadFile для загрузки файла
      return await this.uploadFile(file, options);
    } catch (error) {
      console.error('Ошибка при загрузке Base64 изображения:', error);
      throw error;
    }
  }

  /**
   * Загрузка изображения по URL
   * @param imageUrl URL изображения для загрузки
   * @param options Опции загрузки
   * @returns Promise с URL загруженного изображения
   */
  async uploadFromUrl(imageUrl: string, options: UploadOptions = {}): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('source', imageUrl);
      formData.append('key', options.apiKey || this.apiKey);

      if (options.title) {
        formData.append('title', options.title);
      }

      if (options.description) {
        formData.append('description', options.description);
      }

      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }

      if (options.expiration) {
        formData.append('expiration', options.expiration);
      }

      if (options.nsfw !== undefined) {
        formData.append('nsfw', options.nsfw ? '1' : '0');
      }

      // Указываем формат ответа JSON
      formData.append('format', 'json');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': options.apiKey || this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as PostImageResponse;

      if (data.status_code !== 200 || !data.image) {
        throw new Error(data.error?.message || 'Неизвестная ошибка при загрузке изображения');
      }

      // Возвращаем URL загруженного изображения
      return data.image.url;
    } catch (error) {
      console.error('Ошибка при загрузке изображения по URL:', error);
      throw error;
    }
  }
}

// Экспортируем экземпляр сервиса для использования в приложении
export const postImageService = new PostImageService();
