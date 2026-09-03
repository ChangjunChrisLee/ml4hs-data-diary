export const LANGUAGE_COOKIE = 'ml4hs-language'

export const locales = ['en', 'ko'] as const

export type Locale = (typeof locales)[number]

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale)
}

export function pick<T>(locale: Locale, english: T, korean: T): T {
  return locale === 'ko' ? korean : english
}

const AUTH_ERROR_KO: Record<string, string> = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'Email not confirmed': '이메일 인증을 먼저 완료해주세요.',
  'User already registered': '이미 가입된 이메일입니다.',
  'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 합니다.',
  'Email rate limit exceeded': '이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
}

export function localizeError(
  locale: Locale,
  message: string,
  koreanFallback = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
) {
  if (locale === 'en') return message
  return AUTH_ERROR_KO[message] ?? koreanFallback
}
