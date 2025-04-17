#!/bin/bash

# Функция для ввода данных с проверкой
get_validated_input() {
  local prompt="$1"
  local min_length="$2"
  local input=""

  while true; do
    read -p "$prompt" input
    if [ ${#input} -ge $min_length ]; then
      echo "$input"
      return 0
    else
      echo "Ошибка: введенное значение должно содержать не менее $min_length символов."
    fi
  done
}

echo "===== Обновление учетных данных администратора ====="
echo "Введите новые учетные данные для входа в админ-панель."
echo

# Получаем новые логин и пароль
NEW_USERNAME=$(get_validated_input "Новый логин (минимум 3 символа): " 3)
NEW_PASSWORD=$(get_validated_input "Новый пароль (минимум 6 символов): " 6)

echo
echo "Новые учетные данные:"
echo "Логин: $NEW_USERNAME"
echo "Пароль: $NEW_PASSWORD"
echo

# Подтверждение
read -p "Подтвердите изменение учетных данных (y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Операция отменена."
  exit 0
fi

# Файл auth.ts
AUTH_FILE="src/lib/auth.ts"

# Обновляем учетные данные в файле auth.ts
if [ -f "$AUTH_FILE" ]; then
  echo "Обновляем файл: $AUTH_FILE"

  # Заменяем логин и пароль
  sed -i "s/credentials.username === \"[^\"]*\"/credentials.username === \"$NEW_USERNAME\"/" "$AUTH_FILE"
  sed -i "s/credentials.password === \"[^\"]*\"/credentials.password === \"$NEW_PASSWORD\"/" "$AUTH_FILE"

  echo "Учетные данные успешно обновлены!"
else
  echo "Ошибка: Файл $AUTH_FILE не найден"
  exit 1
fi

# Обновляем предустановленные значения на странице входа
LOGIN_PAGE="src/app/admin/login/page.tsx"
if [ -f "$LOGIN_PAGE" ]; then
  echo "Обновляем страницу входа: $LOGIN_PAGE"

  # Заменяем предустановленные значения
  sed -i "s/useState(\"[^\"]*\") \/\/ username/useState(\"$NEW_USERNAME\") \/\/ username/" "$LOGIN_PAGE"
  sed -i "s/useState(\"[^\"]*\") \/\/ password/useState(\"$NEW_PASSWORD\") \/\/ password/" "$LOGIN_PAGE"

  # Если предыдущая команда не сработала, пробуем другой вариант
  if [ $? -ne 0 ]; then
    # Метка для username
    sed -i "/\[username, setUsername\]/s/useState(\"[^\"]*\")/useState(\"$NEW_USERNAME\")/" "$LOGIN_PAGE"
    # Метка для password
    sed -i "/\[password, setPassword\]/s/useState(\"[^\"]*\")/useState(\"$NEW_PASSWORD\")/" "$LOGIN_PAGE"
  fi

  echo "Страница входа обновлена!"
else
  echo "Предупреждение: Файл страницы входа $LOGIN_PAGE не найден"
fi

echo
echo "Обновление завершено. Перезапустите приложение для применения изменений:"
echo "./deploy_vps.sh"
