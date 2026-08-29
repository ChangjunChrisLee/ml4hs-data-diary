import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return new NextResponse('Forbidden', { status: 403 })

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('log_date, sleep_hours, study_hours, exercise_done, media_tv_ott, media_longform, media_shortform, media_sns, media_messenger, media_game, media_music, media_news, media_webtoon, media_reading, media_ai, device_tv_ott, device_longform, device_shortform, device_sns, device_messenger, device_game, device_music, device_news, device_webtoon, device_reading, device_ai, genre_tv_ott, genre_longform, genre_shortform, genre_game, genre_music, bedtime_tv_ott, bedtime_longform, bedtime_shortform, bedtime_sns, bedtime_messenger, bedtime_game, bedtime_music, bedtime_news, bedtime_webtoon, bedtime_reading, bedtime_ai, mood, stress, fatigue, focus, day_type, probe_value_1, probe_value_2, probe_value_3, probe_value_4, probe_value_5, notes, student_id, profiles(anonymous_id, probe_label_1, probe_label_2, probe_label_3, probe_label_4, probe_label_5)')
    .order('log_date', { ascending: true })

  const headers = [
    'anonymous_id',
    'probe_label_1', 'probe_label_2', 'probe_label_3', 'probe_label_4', 'probe_label_5',
    'log_date',
    'sleep_hours', 'study_hours', 'exercise_done',
    'media_tv_ott', 'media_longform', 'media_shortform', 'media_sns', 'media_messenger',
    'media_game', 'media_music', 'media_news', 'media_webtoon', 'media_reading', 'media_ai', 'media_total',
    'device_tv_ott', 'device_longform', 'device_shortform', 'device_sns', 'device_messenger',
    'device_game', 'device_music', 'device_news', 'device_webtoon', 'device_reading', 'device_ai',
    'genre_tv_ott', 'genre_longform', 'genre_shortform', 'genre_game', 'genre_music',
    'bedtime_tv_ott', 'bedtime_longform', 'bedtime_shortform', 'bedtime_sns', 'bedtime_messenger',
    'bedtime_game', 'bedtime_music', 'bedtime_news', 'bedtime_webtoon', 'bedtime_reading', 'bedtime_ai',
    'mood', 'stress', 'fatigue', 'focus', 'day_type',
    'probe_value_1', 'probe_value_2', 'probe_value_3', 'probe_value_4', 'probe_value_5',
    'notes',
  ]

  const bool = (v: boolean | null) => v == null ? '' : v ? 'yes' : 'no'

  const rows = (logs ?? []).map(l => {
    const p = l.profiles as unknown as {
      anonymous_id: string
      probe_label_1: string | null; probe_label_2: string | null; probe_label_3: string | null
      probe_label_4: string | null; probe_label_5: string | null
    } | null
    const total = (l.media_tv_ott ?? 0) + (l.media_longform ?? 0) + (l.media_shortform ?? 0)
      + (l.media_sns ?? 0) + (l.media_messenger ?? 0) + (l.media_game ?? 0)
      + (l.media_music ?? 0) + (l.media_news ?? 0) + (l.media_webtoon ?? 0)
      + (l.media_reading ?? 0) + (l.media_ai ?? 0)
    return [
      p?.anonymous_id ?? '',
      p?.probe_label_1 ?? '', p?.probe_label_2 ?? '', p?.probe_label_3 ?? '',
      p?.probe_label_4 ?? '', p?.probe_label_5 ?? '',
      l.log_date,
      l.sleep_hours ?? '', l.study_hours ?? '', bool(l.exercise_done),
      l.media_tv_ott ?? '', l.media_longform ?? '', l.media_shortform ?? '',
      l.media_sns ?? '', l.media_messenger ?? '', l.media_game ?? '',
      l.media_music ?? '', l.media_news ?? '', l.media_webtoon ?? '',
      l.media_reading ?? '', l.media_ai ?? '', total.toFixed(1),
      l.device_tv_ott ?? '', l.device_longform ?? '', l.device_shortform ?? '',
      l.device_sns ?? '', l.device_messenger ?? '', l.device_game ?? '',
      l.device_music ?? '', l.device_news ?? '', l.device_webtoon ?? '', l.device_reading ?? '', l.device_ai ?? '',
      l.genre_tv_ott ?? '', l.genre_longform ?? '', l.genre_shortform ?? '',
      l.genre_game ?? '', l.genre_music ?? '',
      bool(l.bedtime_tv_ott), bool(l.bedtime_longform), bool(l.bedtime_shortform),
      bool(l.bedtime_sns), bool(l.bedtime_messenger), bool(l.bedtime_game),
      bool(l.bedtime_music), bool(l.bedtime_news), bool(l.bedtime_webtoon), bool(l.bedtime_reading), bool(l.bedtime_ai),
      l.mood ?? '', l.stress ?? '', l.fatigue ?? '', l.focus ?? '',
      l.day_type ?? '',
      l.probe_value_1 ?? '', l.probe_value_2 ?? '', l.probe_value_3 ?? '',
      l.probe_value_4 ?? '', l.probe_value_5 ?? '',
      `"${(l.notes ?? '').replace(/"/g, '""')}"`,
    ].join(',')
  })

  const csv = [headers.join(','), ...rows].join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="ml4hs-logs.csv"',
    },
  })
}
