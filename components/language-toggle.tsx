'use client'

import { useLanguage } from '@/components/language-provider'

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLanguage()

  return (
    <div
      className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5"
      role="group"
      aria-label={t('Select language', '언어 선택')}
    >
      {(['ko', 'en'] as const).map(value => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
          className={`${compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-md transition-colors ${
            locale === value
              ? 'bg-gray-900 text-white'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {value === 'ko' ? '한국어' : 'English'}
        </button>
      ))}
    </div>
  )
}
