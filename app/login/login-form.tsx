'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginForm() {
  const router = useRouter()

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
        setMessage(error.message)
      } else {
        setIsError(false)
        setMessage('Check your email and click the confirmation link.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setIsError(true)
        setMessage(error.message)
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
      setMessage('Enter your email address first.')
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
      setMessage(error.message)
    } else {
      setIsError(false)
      setMessage('Confirmation email sent. Please check your inbox and spam folder.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Your school email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="6 characters or more"
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
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>

            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setMessage('') }}
              className="w-full text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              {isSignUp ? 'Already have an account? → Sign In' : 'New here? → Sign Up'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || loading}
              className="w-full text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              {resending ? 'Sending confirmation email...' : 'Resend confirmation email'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
