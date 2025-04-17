-- Миграция для добавления таблицы Benefits
CREATE TABLE IF NOT EXISTS `Benefit` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(50) NOT NULL,
  `order` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Добавляем начальные данные
INSERT INTO `Benefit` (`title`, `description`, `icon`, `order`) VALUES
('Безопасность', 'Все наши водители имеют большой опыт вождения и проходят регулярные проверки. Автомобили оснащены современными системами безопасности.', 'Shield', 1),
('Пунктуальность', 'Мы ценим ваше время и гарантируем, что водитель прибудет вовремя. Постоянный мониторинг дорожной ситуации позволяет избегать задержек.', 'Clock', 2),
('Комфорт', 'Современные автомобили с кондиционером, Wi-Fi и другими удобствами сделают вашу поездку максимально комфортной независимо от расстояния.', 'Truck', 3),
('Удобная оплата', 'Различные способы оплаты: наличными, банковской картой или онлайн. Выберите наиболее удобный для вас вариант.', 'CreditCard', 4),
('Опытные водители', 'Наши водители говорят на русском и английском языках, знают дороги и особенности пересечения границ, помогут с багажом.', 'ThumbsUp', 5),
('24/7 поддержка', 'Служба поддержки доступна круглосуточно. Мы готовы ответить на ваши вопросы и решить любые проблемы в любое время.', 'Headphones', 6);

-- Дополнительные статистики для секции преимуществ
CREATE TABLE IF NOT EXISTS `BenefitStats` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `clients` VARCHAR(50) NOT NULL DEFAULT '5000+',
  `directions` VARCHAR(50) NOT NULL DEFAULT '15+',
  `experience` VARCHAR(50) NOT NULL DEFAULT '10+',
  `support` VARCHAR(50) NOT NULL DEFAULT '24/7',
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Добавляем начальные данные статистики
INSERT INTO `BenefitStats` (`id`, `clients`, `directions`, `experience`, `support`)
VALUES (1, '5000+', '15+', '10+', '24/7')
ON DUPLICATE KEY UPDATE `id` = `id`;
