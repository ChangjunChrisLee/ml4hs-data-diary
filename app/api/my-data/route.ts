import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const LOG_FIELDS = [
  'log_date',
  'sleep_hours', 'study_hours', 'exercise_done',
  'media_tv_ott', 'media_longform', 'media_shortform', 'media_sns', 'media_messenger',
  'media_game', 'media_music', 'media_news', 'media_webtoon', 'media_reading', 'media_ai',
  'device_tv_ott', 'device_longform', 'device_shortform', 'device_sns', 'device_messenger',
  'device_game', 'device_music', 'device_news', 'device_webtoon', 'device_reading', 'device_ai',
  'genre_tv_ott', 'genre_longform', 'genre_shortform', 'genre_game', 'genre_music',
  'bedtime_tv_ott', 'bedtime_longform', 'bedtime_shortform', 'bedtime_sns', 'bedtime_messenger',
  'bedtime_game', 'bedtime_music', 'bedtime_news', 'bedtime_webtoon', 'bedtime_reading', 'bedtime_ai',
  'mood', 'stress', 'fatigue', 'focus', 'day_type',
  'probe_value_1', 'probe_value_2', 'probe_value_3', 'probe_value_4', 'probe_value_5',
  'notes',
] as const

const MEDIA_FIELDS = [
  'media_tv_ott', 'media_longform', 'media_shortform', 'media_sns', 'media_messenger',
  'media_game', 'media_music', 'media_news', 'media_webtoon', 'media_reading', 'media_ai',
] as const

const PROFILE_FIELDS = [
  'anonymous_id',
  'probe_label_1', 'probe_label_2', 'probe_label_3', 'probe_label_4', 'probe_label_5',
] as const

function csvCell(value: unknown) {
  if (value === null || value === undefined) return ''

  const text = String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function booleanCell(value: unknown) {
  if (value === null || value === undefined) return ''
  return value ? 'yes' : 'no'
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const [{ data: profile, error: profileError }, { data: logs, error: logsError }] = await Promise.all([
    supabase
      .from('profiles')
      .select(PROFILE_FIELDS.join(','))
      .eq('id', user.id)
      .single(),
    supabase
      .from('daily_logs')
      .select(LOG_FIELDS.join(','))
      .eq('student_id', user.id)
      .order('log_date', { ascending: true }),
  ])

  if (profileError || logsError) {
    console.error('Failed to export student data', { profileError, logsError })
    return new NextResponse('Failed to export data', { status: 500 })
  }

  const headers = [
    ...PROFILE_FIELDS,
    'log_date',
    'sleep_hours', 'study_hours', 'exercise_done',
    ...MEDIA_FIELDS, 'media_total',
    'device_tv_ott', 'device_longform', 'device_shortform', 'device_sns', 'device_messenger',
    'device_game', 'device_music', 'device_news', 'device_webtoon', 'device_reading', 'device_ai',
    'genre_tv_ott', 'genre_longform', 'genre_shortform', 'genre_game', 'genre_music',
    'bedtime_tv_ott', 'bedtime_longform', 'bedtime_shortform', 'bedtime_sns', 'bedtime_messenger',
    'bedtime_game', 'bedtime_music', 'bedtime_news', 'bedtime_webtoon', 'bedtime_reading', 'bedtime_ai',
    'mood', 'stress', 'fatigue', 'focus', 'day_type',
    'probe_value_1', 'probe_value_2', 'probe_value_3', 'probe_value_4', 'probe_value_5',
    'notes',
  ]

  const booleanFields = new Set([
    'exercise_done',
    'bedtime_tv_ott', 'bedtime_longform', 'bedtime_shortform', 'bedtime_sns', 'bedtime_messenger',
    'bedtime_game', 'bedtime_music', 'bedtime_news', 'bedtime_webtoon', 'bedtime_reading', 'bedtime_ai',
  ])
  const profileRecord = profile as unknown as Record<string, unknown>

  const rows = (logs ?? []).map(log => {
    const logRecord = log as unknown as Record<string, unknown>
    const mediaTotal = MEDIA_FIELDS.reduce((sum, field) => sum + (Number(logRecord[field]) || 0), 0)
    const values: unknown[] = [
      ...PROFILE_FIELDS.map(field => profileRecord[field] ?? ''),
      ...headers.slice(PROFILE_FIELDS.length).map(header => {
        if (header === 'media_total') return mediaTotal.toFixed(1)
        const value = logRecord[header]
        return booleanFields.has(header) ? booleanCell(value) : value
      }),
    ]

    return values.map(csvCell).join(',')
  })

  const csv = `\uFEFF${[headers.map(csvCell).join(','), ...rows].join('\r\n')}`

  return new NextResponse(csv, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ml4hs-my-data.csv"',
    },
  })
}
