'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import LanguageToggle from '@/components/language-toggle'
import { useLanguage } from '@/components/language-provider'
import { localizeError } from '@/lib/i18n'

export default function LoginForm() {
  const router = useRouter()
  const { locale, t } = useLanguage()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const supabase = createClient()

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/login` },
      })
      if (error) {
        setIsError(true)
        setMessage(localizeError(locale, error.message))
      } else {
        setIsError(false)
        setMessage(t('Check your email and click the confirmation link.', '이메일을 확인하고 인증 링크를 눌러주세요.'))
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setIsError(true)
        setMessage(localizeError(locale, error.message))
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    }

    setLoading(false)
  }

  async function handleResend() {
    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      setIsError(true)
      setMessage(t('Enter your email address first.', '먼저 이메일 주소를 입력해주세요.'))
      return
    }

    setResending(true)
    setMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })

    setResending(false)
    if (error) {
      setIsError(true)
      setMessage(localizeError(locale, error.message))
    } else {
      setIsError(false)
      setMessage(t('Confirmation email sent. Please check your inbox and spam folder.', '인증 이메일을 보냈습니다. 받은편지함과 스팸함을 확인해주세요.'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">ML4HS Data Diary</CardTitle>
          <CardDescription>
            ML for Understanding Humans and Society · SKKU
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">{t('Email', '이메일')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('Your school email', '학교 이메일')}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t('Password', '비밀번호')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('6 characters or more', '6자 이상')}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {message && (
              <p className={`text-sm ${isError ? 'text-red-500' : 'text-green-600'}`}>
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('Processing...', '처리 중...') : isSignUp ? t('Sign Up', '회원가입') : t('Sign In', '로그인')}
            </Button>

            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
              className="w-full text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              {isSignUp ? t('Already have an account? → Sign In', '이미 계정이 있나요? → 로그인') : t('New here? → Sign Up', '처음이신가요? → 회원가입')}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || loading}
              className="w-full text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              {resending ? t('Sending confirmation email...', '인증 이메일 보내는 중...') : t('Resend confirmation email', '인증 이메일 다시 보내기')}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
