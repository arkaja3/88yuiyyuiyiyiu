/**
 * Скрипт для очистки файла .env от проблемных символов (CR, пробелы, табуляции)
 * Запуск: node clean-env.js
 */

const fs = require('fs');
const path = require('path');

// Путь к файлу .env
const envPath = path.join(__dirname, '.env');

try {
  console.log(`Очистка файла .env от проблемных символов...`);

  // Читаем содержимое файла
  const content = fs.readFileSync(envPath, 'utf8');

  // Разбиваем на строки с учетом возможных CR/LF символов
  const lines = content.split(/\r?\n/);

  // Очищаем каждую строку
  const cleanedLines = lines.map(line => {
    // Пропускаем пустые строки и комментарии
    if (!line.trim() || line.trim().startsWith('#')) {
      return line;
    }

    // Ищем позицию первого = (разделитель ключ=значение)
    const equalPos = line.indexOf('=');
    if (equalPos === -1) {
      return line; // Не найден знак равенства, возвращаем строку как есть
    }

    // Разделяем ключ и значение
    const key = line.substring(0, equalPos).trim();
    let value = line.substring(equalPos + 1).trim();

    // Если значение в кавычках, обрабатываем его
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1); // Удаляем кавычки
      value = value.replace(/[\r\t\f\v]/g, ''); // Удаляем специальные символы
      value = `"${value}"`; // Восстанавливаем кавычки
    }

    return `${key}=${value}`;
  });

  // Соединяем строки обратно с LF (Unix) окончаниями строк
  const cleanedContent = cleanedLines.join('\n');

  // Записываем очищенный контент обратно в файл
  fs.writeFileSync(envPath, cleanedContent, 'utf8');

  console.log(`Файл .env успешно очищен от проблемных символов.`);

  // Выводим содержимое очищенного файла (без паролей)
  const displayLines = cleanedLines.map(line => {
    if (line.includes('PASSWORD') || line.includes('SECRET')) {
      const parts = line.split('=');
      return `${parts[0]}=[HIDDEN]`;
    }
    return line;
  });

  console.log(`\nСодержимое очищенного файла .env:`);
  console.log(displayLines.join('\n'));

} catch (error) {
  console.error(`Ошибка при очистке файла .env:`, error);
  process.exit(1);
}
