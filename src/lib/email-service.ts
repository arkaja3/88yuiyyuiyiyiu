import nodemailer, { TransportOptions } from 'nodemailer'

// Типы для удобства работы с Email
export type EmailConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  from?: string
}

export type EmailOptions = {
  to: string | string[]
  subject: string
  text: string
  html: string
  replyTo?: string
}

/**
 * Сервис для отправки электронных писем
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig | null = null

  /**
   * Создает экземпляр EmailService с конфигурацией из переменных окружения
   */
  constructor() {
    // Проверяем наличие необходимых переменных окружения
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    ) {
      this.config = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM || process.env.SMTP_USER
      }

      this.initTransporter()
    } else {
      console.warn('Email service: Some SMTP environment variables are missing')
    }
  }

  /**
   * Инициализирует транспортер nodemailer с заданной конфигурацией
   */
  private initTransporter(): void {
    if (!this.config) return

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.user,
        pass: this.config.password
      }
      // Раскомментируйте для отладки проблем с TLS/SSL
      // tls: {
      //   rejectUnauthorized: false
      // }
    })
  }

  /**
   * Отправляет электронное письмо
   * @param options - Параметры письма
   * @returns Promise<boolean> - Успешность отправки
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.error('Email service: Transporter not initialized')
      return false
    }

    try {
      const mailOptions = {
        from: `"Royal Transfer" <${this.config.from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log(`Email sent successfully: ${info.messageId}`)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  /**
   * Проверяет, настроен ли email-сервис
   * @returns boolean
   */
  isConfigured(): boolean {
    return !!this.transporter && !!this.config
  }
}

// Создаем глобальный экземпляр сервиса для повторного использования
const emailService = new EmailService()
export default emailService
