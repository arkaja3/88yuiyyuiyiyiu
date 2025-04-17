#!/bin/bash

# Загрузить переменные окружения из .env файла
if [ -f .env ]; then
  echo "Загрузка переменных окружения из файла .env..."
  export $(grep -v '^#' .env | xargs)
fi

# Остановить предыдущий процесс, если он запущен
if [ -f ".pid" ]; then
  pid=$(cat .pid)
  if ps -p $pid > /dev/null; then
    echo "Остановка предыдущего процесса (PID: $pid)..."
    kill $pid
  fi
  rm .pid
fi

# Устанавливаем зависимости
echo "Установка зависимостей..."
bun install

# Генерируем клиент Prisma
echo "Генерация Prisma клиента..."
npx prisma generate

# Собираем приложение Next.js для продакшена
echo "Сборка Next.js приложения..."
bun run build

# Запускаем приложение в режиме продакшена
echo "Запуск Next.js приложения в режиме продакшена..."
nohup bun run start -H 0.0.0.0 -p 3000 > app.log 2>&1 & echo $! > .pid

echo "Приложение запущено! PID: $(cat .pid)"
echo "Логи доступны в файле app.log"
