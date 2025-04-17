#!/bin/bash

# Фиксированный секретный ключ для NextAuth
FIXED_SECRET="b3845db50fe5c5b7ad1e83d7a9b5fdc9ad09e7e67e2ebc184a5d328225a22e92"

# Проверка наличия файлов, где хранится ключ
FILES_TO_UPDATE=(
  "src/lib/auth.ts"
  "src/middleware.ts"
)

# Выводим информацию
echo "Обновление фиксированных секретных ключей..."
echo "Используемый ключ: $FIXED_SECRET"
echo

# Обновляем ключи в файлах
for file in "${FILES_TO_UPDATE[@]}"; do
  if [ -f "$file" ]; then
    echo "Обновляем файл: $file"
    # Заменяем секретный ключ
    sed -i "s/secret: .*,/secret: \"$FIXED_SECRET\",/g" "$file"
  else
    echo "Предупреждение: Файл $file не найден"
  fi
done

echo
echo "Обновление завершено. Перезапустите приложение для применения изменений."
