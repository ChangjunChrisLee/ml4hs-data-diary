'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function AppHeader({
  anonymousId,
  isAdmin = false,
}: {
  anonymousId?: string
  isAdmin?: boolean
}) {
  const path = usePathname()

  const nav = [
    { href: '/home',      label: 'Home'     },
    { href: '/dashboard', label: 'My Diary' },
    { href: '/team',      label: 'Team'     },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <header className="bg-white border-b px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-sm text-gray-800">ML4HS</span>
        <nav className="flex gap-0.5">
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
      <div className="flex items-center gap-3">
        {anonymousId && <span className="text-xs text-gray-400">{anonymousId}</span>}
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="sm" type="submit">Sign Out</Button>
        </form>
      </div>
    </header>
  )
}
