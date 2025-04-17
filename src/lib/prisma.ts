import { PrismaClient } from '@prisma/client'

// Глобальная переменная для поддержки единственного экземпляра
declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | PrismaClient
}

// Логика создания клиента с обработкой исключений
function createPrismaClient() {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    // Проверяем подключение при создании клиента
    client.$connect()
      .then(() => console.log('Connected to database'))
      .catch((e) => console.error('Failed to connect to database:', e))

    return client
  } catch (error) {
    console.error('Error initializing Prisma client:', error)
    throw new Error('Failed to initialize database client')
  }
}

const globalPrisma = globalThis.prisma
export const prisma = globalPrisma ?? createPrismaClient()

export default prisma

// Предотвращение создания нескольких экземпляров в режиме разработки
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export const getPrismaClient = () => {
  return prisma
}
