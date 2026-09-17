import 'server-only'

import { cookies } from 'next/headers'
import { isLocale, LANGUAGE_COOKIE, type Locale } from '@/lib/i18n'

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LANGUAGE_COOKIE)?.value
  return isLocale(value) ? value : 'en'
}
