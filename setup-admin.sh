#!/bin/bash

# Проверяем наличие .env файла
if [ ! -f .env ]; then
  echo "Файл .env не найден. Создаем новый..."
  touch .env
fi

# Добавляем или обновляем переменные для авторизации только если они не существуют
echo "Проверка настроек авторизации администратора..."

# Проверяем наличие переменных ADMIN_USERNAME и ADMIN_PASSWORD в .env
grep -q "ADMIN_USERNAME" .env
if [ $? -ne 0 ]; then
  echo "ADMIN_USERNAME не найден, добавляем..."
  echo "ADMIN_USERNAME=\"admin\"" >> .env
  echo "Установлен логин: admin"
else
  echo "ADMIN_USERNAME уже настроен, используем существующее значение."
fi

grep -q "ADMIN_PASSWORD" .env
if [ $? -ne 0 ]; then
  echo "ADMIN_PASSWORD не найден, добавляем..."
  echo "ADMIN_PASSWORD=\"secure_password\"" >> .env
  echo "Установлен пароль: secure_password"
else
  echo "ADMIN_PASSWORD уже настроен, используем существующее значение."
fi

grep -q "NEXTAUTH_SECRET" .env
if [ $? -ne 0 ]; then
  echo "NEXTAUTH_SECRET не найден, добавляем..."
  secret=$(openssl rand -base64 32)
  echo "NEXTAUTH_SECRET=\"$secret\"" >> .env
  echo "Установлен секретный ключ."
else
  echo "NEXTAUTH_SECRET уже настроен, используем существующее значение."
fi

grep -q "NEXTAUTH_URL" .env
if [ $? -ne 0 ]; then
  echo "NEXTAUTH_URL не найден, добавляем..."
  echo "NEXTAUTH_URL=\"https://royaltransfer.org\"" >> .env
  echo "Установлен URL: https://royaltransfer.org"
else
  echo "NEXTAUTH_URL уже настроен, используем существующее значение."
fi

echo "Готово! Настройки авторизации администратора проверены."
echo "Для просмотра текущих настроек введите: cat .env | grep ADMIN"
echo
echo "Перезапустите приложение для применения изменений с помощью ./deploy_vps.sh"
