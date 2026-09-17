'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import LanguageToggle from '@/components/language-toggle'
import { useLanguage } from '@/components/language-provider'

export default function AppHeader({
  anonymousId,
  isAdmin = false,
}: {
  anonymousId?: string
  isAdmin?: boolean
}) {
  const path = usePathname()
  const { t } = useLanguage()

  const nav = [
    { href: '/home',      label: t('Home', '홈') },
    { href: '/dashboard', label: t('My Diary', '내 다이어리') },
    { href: '/team',      label: t('Team', '팀') },
    ...(isAdmin ? [{ href: '/admin', label: t('Admin', '관리자') }] : []),
  ]

  return (
    <header className="bg-white border-b px-4 py-3 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-semibold text-sm text-gray-800">ML4HS</span>
        <nav className="flex gap-0.5 overflow-x-auto min-w-0">
          {nav.map(l => (
            <Link key={l.href} href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                path.startsWith(l.href)
                  ? 'bg-gray-100 font-medium text-gray-900'
                  : 'text-gray-500 hover:text-gray-800'
              }`}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center justify-end gap-2 sm:gap-3">
        <LanguageToggle compact />
        {anonymousId && <span className="text-xs text-gray-400">{anonymousId}</span>}
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="sm" type="submit">{t('Sign Out', '로그아웃')}</Button>
        </form>
      </div>
    </header>
  )
}
