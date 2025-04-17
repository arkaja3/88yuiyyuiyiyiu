'use client'

import { useEffect } from 'react';

interface VoiceSearchData {
  question: string;
  answer: string;
}

/**
 * Хук для добавления разметки для голосового поиска
 * Помогает оптимизировать страницу для ответов Google Assistant и других голосовых ассистентов
 */
export function useVoiceSearchOptimization(data: VoiceSearchData[]) {
  useEffect(() => {
    // Добавляем микроразметку для вопросов и ответов
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'voice-search-data';

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': data.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }))
    };

    script.innerHTML = JSON.stringify(jsonLdData);
    document.head.appendChild(script);

    // Добавляем специальные атрибуты data-vs для голосового поиска
    data.forEach((item, index) => {
      // Создаем скрытые контейнеры для голосового поиска
      const container = document.createElement('div');
      container.setAttribute('data-voice-search', 'true');
      container.style.display = 'none';

      const question = document.createElement('h3');
      question.setAttribute('data-vs-question', String(index));
      question.textContent = item.question;

      const answer = document.createElement('p');
      answer.setAttribute('data-vs-answer', String(index));
      answer.textContent = item.answer;

      container.appendChild(question);
      container.appendChild(answer);
      document.body.appendChild(container);
    });

    // Удаляем при размонтировании компонента
    return () => {
      const script = document.getElementById('voice-search-data');
      if (script) {
        document.head.removeChild(script);
      }

      // Удаляем контейнеры данных для голосового поиска
      document.querySelectorAll('div[data-voice-search="true"]').forEach(el => {
        document.body.removeChild(el);
      });
    };
  }, [data]);
}

/**
 * Компонент для голосового поиска часто задаваемых вопросов
 */
export function VoiceSearchFAQ({ data }: { data: VoiceSearchData[] }) {
  useVoiceSearchOptimization(data);

  // Отображаем видимые вопросы и ответы на странице
  return (
    <div className="voice-search-faq" itemScope itemType="https://schema.org/FAQPage">
      {data.map((item, index) => (
        <div key={index} className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
          <h3 itemProp="name">{item.question}</h3>
          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
            <p itemProp="text">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Функция для создания разметки для голосового действия (voice action)
 */
export function generateVoiceAction(actionName: string, targetUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EntryPoint',
    'actionPlatform': [
      'https://schema.googleapis.com/GoogleAssistant',
      'https://schema.googleapis.com/AlexaForBusiness'
    ],
    'urlTemplate': targetUrl,
    'name': actionName,
    'description': `Голосовая команда для ${actionName}`
  };
}

/**
 * Генерирует JSON-LD данные для лучшей интеграции с голосовыми помощниками
 */
export function generateSpeakableData(cssSelector: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'speakable': {
      '@type': 'SpeakableSpecification',
      'cssSelector': [cssSelector]
    }
  };
}
