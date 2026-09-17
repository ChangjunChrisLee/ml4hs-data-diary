'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LANGUAGE_COOKIE, pick, type Locale } from '@/lib/i18n'

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: <T>(english: T, korean: T) => T
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale
  children: React.ReactNode
}) {
  const router = useRouter()
  const [locale, setLocaleState] = useState(initialLocale)

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale(nextLocale) {
      if (nextLocale === locale) return
      setLocaleState(nextLocale)
      document.documentElement.lang = nextLocale
      document.cookie = `${LANGUAGE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
      router.refresh()
    },
    t: (english, korean) => pick(locale, english, korean),
  }), [locale, router])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
