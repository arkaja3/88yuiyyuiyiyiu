// Учетные данные администратора
// Этот файл используется в качестве резервного варианта,
// если переменные окружения не доступны

// Получаем учетные данные из переменных окружения
export const ADMIN_CREDENTIALS = {
  // Не устанавливаем значения по умолчанию, чтобы не перезаписывать значения из .env
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD
};

// Функция для проверки учетных данных
export function validateAdminCredentials(username: string, password: string): boolean {
  // Отладочная информация
  console.log("Валидация учетных данных:");
  console.log("Ожидаемый логин:", ADMIN_CREDENTIALS.username || "[не установлен]");
  console.log("Введенный логин:", username);
  console.log("Ожидаемый пароль установлен:", !!ADMIN_CREDENTIALS.password);
  console.log("Введенный пароль введен:", !!password);

  // Проверка, что значения переменных окружения установлены
  if (!ADMIN_CREDENTIALS.username || !ADMIN_CREDENTIALS.password) {
    console.error("ОШИБКА: Учетные данные администратора не настроены в .env файле!");
    return false;
  }

  // Сравниваем введенные данные с учетными данными из .env
  return username === ADMIN_CREDENTIALS.username &&
         password === ADMIN_CREDENTIALS.password;
}
