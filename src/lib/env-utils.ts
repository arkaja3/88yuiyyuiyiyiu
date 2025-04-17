/**
 * Очищает строку от скрытых символов (включая \r и другие непечатаемые символы)
 */
export function cleanEnvValue(value: string | undefined): string {
  if (!value) return '';

  // Удаляем все непечатаемые символы и пробелы по краям
  return value
    .replace(/[\r\n\t\f\v]/g, '') // удаление специальных символов
    .trim();
}

/**
 * Безопасно получает переменную окружения, очищая её от проблемных символов
 */
export function getCleanEnv(key: string, defaultValue: string = ''): string {
  const value = process.env[key];
  if (!value) return defaultValue;

  const cleanedValue = cleanEnvValue(value);
  console.log(`ENV ${key}: [${cleanedValue}]`); // Для отладки

  return cleanedValue;
}

/**
 * Безопасно получает числовую переменную окружения
 */
export function getNumberEnv(key: string, defaultValue: number): number {
  const value = getCleanEnv(key);
  if (!value) return defaultValue;

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Безопасно получает булевую переменную окружения
 */
export function getBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = getCleanEnv(key).toLowerCase();

  if (value === 'true' || value === '1' || value === 'yes') return true;
  if (value === 'false' || value === '0' || value === 'no') return false;

  return defaultValue;
}
