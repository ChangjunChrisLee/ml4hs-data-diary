'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

// ── Device options ───────────────────────────────────────────────────────────
const DEVICE_OPTS = [
  { value: 'smartphone', label: '스마트폰' },
  { value: 'tv_monitor', label: 'TV·모니터' },
  { value: 'tablet',     label: '태블릿' },
  { value: 'pc_laptop',  label: 'PC·노트북' },
  { value: 'console',    label: '게임기' },
  { value: 'ebook',      label: 'e-book 리더' },
  { value: 'other',      label: '기타' },
]

// ── Genre option lists ───────────────────────────────────────────────────────
const TV_GENRES = [
  { value: 'drama_film',    label: 'Drama / Film' },
  { value: 'entertainment', label: 'Entertainment / Variety' },
  { value: 'sports',        label: 'Sports' },
  { value: 'news',          label: 'News / Current Affairs' },
  { value: 'documentary',   label: 'Documentary / Nature' },
  { value: 'animation',     label: 'Animation / Anime' },
  { value: 'other',         label: 'Other' },
]
const LONGFORM_GENRES = [
  { value: 'education',     label: 'Education / Tutorial' },
  { value: 'entertainment', label: 'Entertainment / Variety' },
  { value: 'vlog',          label: 'Vlog / Daily Life' },
  { value: 'gaming',        label: 'Gaming / eSports' },
  { value: 'music',         label: 'Music Video' },
  { value: 'talk',          label: 'Talk / Commentary' },
  { value: 'other',         label: 'Other' },
]
const SHORTFORM_GENRES = [
  { value: 'entertainment',  label: 'Entertainment / Humor' },
  { value: 'vlog',           label: 'Vlog / Daily Life' },
  { value: 'dance_music',    label: 'Dance / Music' },
  { value: 'gaming',         label: 'Gaming / eSports' },
  { value: 'beauty_fashion', label: 'Beauty / Fashion' },
  { value: 'news_info',      label: 'News / Info' },
  { value: 'other',          label: 'Other' },
]
const GAME_GENRES = [
  { value: 'fps_action',    label: 'FPS / Action' },
  { value: 'rpg_adventure', label: 'RPG / Adventure' },
  { value: 'moba_strategy', label: 'MOBA / Strategy' },
  { value: 'sports_racing', label: 'Sports / Racing' },
  { value: 'puzzle_casual', label: 'Puzzle / Casual' },
  { value: 'simulation',    label: 'Simulation / Life Sim' },
  { value: 'other',         label: 'Other' },
]
const MUSIC_GENRES = [
  { value: 'pop_kpop',   label: 'Pop / K-pop' },
  { value: 'hiphop_rnb', label: 'Hip-hop / R&B' },
  { value: 'rock_metal', label: 'Rock / Metal' },
  { value: 'classical',  label: 'Classical / OST' },
  { value: 'dance_edm',  label: 'Dance / EDM' },
  { value: 'indie_folk', label: 'Indie / Folk' },
  { value: 'podcast',    label: 'Podcast' },
  { value: 'other',      label: 'Other / Mixed' },
]

// ── Media field definitions ──────────────────────────────────────────────────
type GenreOpt = { value: string; label: string }
type MediaDef = {
  key: string
  label: string
  examples: string
  deviceKey: string
  genreKey?: string
  genres?: GenreOpt[]
  bedtimeKey: string
}

const MEDIA_DEFS: MediaDef[] = [
  { key: 'media_tv_ott',    label: 'TV / OTT',           examples: 'Netflix, Tving, Disney+, IPTV…',      deviceKey: 'device_tv_ott',    genreKey: 'genre_tv_ott',    genres: TV_GENRES,        bedtimeKey: 'tv_ott'    },
  { key: 'media_longform',  label: 'Long-form Video',    examples: 'YouTube, Twitch, V LIVE…',            deviceKey: 'device_longform',  genreKey: 'genre_longform',  genres: LONGFORM_GENRES,  bedtimeKey: 'longform'  },
  { key: 'media_shortform', label: 'Short-form',         examples: 'TikTok, YouTube Shorts, Reels…',      deviceKey: 'device_shortform', genreKey: 'genre_shortform', genres: SHORTFORM_GENRES, bedtimeKey: 'shortform' },
  { key: 'media_sns',       label: 'SNS',                examples: 'Instagram, Facebook, X, Threads…',    deviceKey: 'device_sns',                                                               bedtimeKey: 'sns'       },
  { key: 'media_messenger', label: 'Messenger',          examples: 'KakaoTalk, WhatsApp, Telegram…',      deviceKey: 'device_messenger',                                                         bedtimeKey: 'messenger' },
  { key: 'media_game',      label: 'Games',              examples: 'Mobile, PC, Console…',                deviceKey: 'device_game',      genreKey: 'genre_game',      genres: GAME_GENRES,      bedtimeKey: 'game'      },
  { key: 'media_music',     label: 'Music',              examples: 'Spotify, Apple Music, Melon…',        deviceKey: 'device_music',     genreKey: 'genre_music',     genres: MUSIC_GENRES,     bedtimeKey: 'music'     },
  { key: 'media_news',      label: 'News',               examples: 'Online news, apps, newspapers…',      deviceKey: 'device_news',                                                              bedtimeKey: 'news'      },
  { key: 'media_webtoon',   label: 'Webtoon / Web Novel',examples: 'Naver Webtoon, Kakao Page, Ridi…',    deviceKey: 'device_webtoon',                                                           bedtimeKey: 'webtoon'   },
  { key: 'media_reading',   label: 'Reading',            examples: 'Books, e-books, PDFs…',               deviceKey: 'device_reading',                                                           bedtimeKey: 'reading'   },
  { key: 'media_ai',       label: 'AI 서비스',           examples: 'ChatGPT, Claude, Gemini, Copilot…',    deviceKey: 'device_ai',                                                                bedtimeKey: 'ai'        },
]

const BEDTIME_LABELS: Record<string, string> = {
  tv_ott: 'TV/OTT', longform: 'Long-form', shortform: 'Shorts',
  sns: 'SNS', messenger: 'Messenger', game: 'Games',
  music: 'Music', news: 'News', webtoon: 'Webtoon', reading: 'Reading', ai: 'AI',
}

// ── Reusable components ──────────────────────────────────────────────────────
function ScaleRow({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 flex-1 pr-2">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
              value === n
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function YesNo({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-2">
        {['yes', 'no'].map(v => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`px-4 py-1.5 rounded-lg border text-sm transition-colors ${
              value === v
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}>
            {v === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
const today = new Date().toLocaleDateString('sv')

type HoursForm = Record<string, string>
type GenreForm = Record<string, string>

export default function NewLogPage() {
  const router = useRouter()
  const [probeLabels, setProbeLabels] = useState<(string | null)[]>([null, null, null, null, null])

  const [logDate, setLogDate]         = useState(today)
  const [sleepHours, setSleepHours]   = useState('')
  const [studyHours, setStudyHours]   = useState('')
  const [exercise, setExercise]       = useState('')
  const [hours, setHoursState]        = useState<HoursForm>(() =>
    Object.fromEntries(MEDIA_DEFS.map(d => [d.key, '']))
  )
  const [devices, setDevicesState]    = useState<GenreForm>({})
  const [genres, setGenresState]      = useState<GenreForm>({})
  const [bedtime, setBedtime]         = useState<Set<string>>(new Set())
  const [mood, setMood]               = useState(0)
  const [stress, setStress]           = useState(0)
  const [fatigue, setFatigue]         = useState(0)
  const [focus, setFocus]             = useState(0)
  const [dayType, setDayType]         = useState('')
  const [probeValues, setProbeValues] = useState(['', '', '', '', ''])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    async function fetchProbe() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('probe_label_1, probe_label_2, probe_label_3, probe_label_4, probe_label_5')
        .eq('id', user.id).single()
      if (data) setProbeLabels([
        data.probe_label_1 ?? null,
        data.probe_label_2 ?? null,
        data.probe_label_3 ?? null,
        data.probe_label_4 ?? null,
        data.probe_label_5 ?? null,
      ])
    }
    fetchProbe()
  }, [])

  function setHour(key: string, v: string) {
    setHoursState(prev => ({ ...prev, [key]: v }))
  }
  function setDevice(key: string, v: string) {
    setDevicesState(prev => ({ ...prev, [key]: v === prev[key] ? '' : v }))
  }
  function setGenre(key: string, v: string) {
    setGenresState(prev => ({ ...prev, [key]: v }))
  }
  function toggleBedtime(key: string) {
    setBedtime(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const mediaTotal = MEDIA_DEFS.reduce((sum, d) => {
    const v = parseFloat(hours[d.key])
    return sum + (isNaN(v) ? 0 : v)
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    function n(v: string) { const x = parseFloat(v); return isNaN(x) ? null : x }
    function b(v: string) { return v === 'yes' ? true : v === 'no' ? false : null }

    const { error: dbError } = await supabase.from('daily_logs').upsert({
      student_id:    user.id,
      log_date:      logDate,
      sleep_hours:   n(sleepHours),
      study_hours:   n(studyHours),
      exercise_done: b(exercise),
      // media hours
      media_tv_ott:    n(hours.media_tv_ott),
      media_longform:  n(hours.media_longform),
      media_shortform: n(hours.media_shortform),
      media_sns:       n(hours.media_sns),
      media_messenger: n(hours.media_messenger),
      media_game:      n(hours.media_game),
      media_music:     n(hours.media_music),
      media_news:      n(hours.media_news),
      media_webtoon:   n(hours.media_webtoon),
      media_reading:   n(hours.media_reading),
      // devices
      device_tv_ott:    devices.device_tv_ott    || null,
      device_longform:  devices.device_longform  || null,
      device_shortform: devices.device_shortform || null,
      device_sns:       devices.device_sns       || null,
      device_messenger: devices.device_messenger || null,
      device_game:      devices.device_game      || null,
      device_music:     devices.device_music     || null,
      device_news:      devices.device_news      || null,
      device_webtoon:   devices.device_webtoon   || null,
      device_reading:   devices.device_reading   || null,
      device_ai:        devices.device_ai        || null,
      // genres
      genre_tv_ott:    genres.genre_tv_ott    || null,
      genre_longform:  genres.genre_longform  || null,
      genre_shortform: genres.genre_shortform || null,
      genre_game:      genres.genre_game      || null,
      genre_music:     genres.genre_music     || null,
      // bedtime
      bedtime_tv_ott:    bedtime.has('tv_ott'),
      bedtime_longform:  bedtime.has('longform'),
      bedtime_shortform: bedtime.has('shortform'),
      bedtime_sns:       bedtime.has('sns'),
      bedtime_messenger: bedtime.has('messenger'),
      bedtime_game:      bedtime.has('game'),
      bedtime_music:     bedtime.has('music'),
      bedtime_news:      bedtime.has('news'),
      bedtime_webtoon:   bedtime.has('webtoon'),
      bedtime_reading:   bedtime.has('reading'),
      bedtime_ai:        bedtime.has('ai'),
      media_ai:          n(hours.media_ai),
      // state
      mood:    mood    || null,
      stress:  stress  || null,
      fatigue: fatigue || null,
      focus:   focus   || null,
      day_type: dayType || null,
      probe_value_1: probeLabels[0] ? n(probeValues[0]) : null,
      probe_value_2: probeLabels[1] ? n(probeValues[1]) : null,
      probe_value_3: probeLabels[2] ? n(probeValues[2]) : null,
      probe_value_4: probeLabels[3] ? n(probeValues[3]) : null,
      probe_value_5: probeLabels[4] ? n(probeValues[4]) : null,
    }, { onConflict: 'student_id,log_date' })

    if (dbError) { setError(dbError.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">←</button>
        <h1 className="font-semibold">Today&apos;s Log</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Date */}
          <div className="space-y-1">
            <Label>Date</Label>
            <Input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
          </div>

          {/* Life Time */}
          <Card>
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">Life Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Sleep (h)</Label>
                  <Input type="number" min="0" max="24" step="0.5" placeholder="0"
                    value={sleepHours} onChange={e => setSleepHours(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Study (h)</Label>
                  <Input type="number" min="0" max="24" step="0.5" placeholder="0"
                    value={studyHours} onChange={e => setStudyHours(e.target.value)} />
                </div>
              </div>
              <YesNo label="Exercised today?" value={exercise} onChange={setExercise} />
            </CardContent>
          </Card>

          {/* Media Breakdown */}
          <Card>
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">
                Media Breakdown (h) ·{' '}
                <span className="text-blue-600 normal-case font-semibold">
                  Total {mediaTotal.toFixed(1)} h
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Per-type rows */}
              <div className="space-y-3">
                {MEDIA_DEFS.map(def => {
                  const hasHours = parseFloat(hours[def.key]) > 0
                  return (
                    <div key={def.key} className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 leading-snug">{def.label}</p>
                          <p className="text-xs text-gray-400 leading-snug">{def.examples}</p>
                        </div>
                        <Input
                          type="number" min="0" max="16" step="0.5" placeholder="0"
                          value={hours[def.key]}
                          onChange={e => setHour(def.key, e.target.value)}
                          className="w-20 text-center shrink-0"
                        />
                      </div>
                      {hasHours && (
                        <div className="flex flex-wrap gap-1.5">
                          {DEVICE_OPTS.map(opt => (
                            <button key={opt.value} type="button"
                              onClick={() => setDevice(def.deviceKey, opt.value)}
                              className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                                devices[def.deviceKey] === opt.value
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'
                              }`}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {def.genres && def.genreKey && hasHours && (
                        <Select
                          value={genres[def.genreKey] ?? ''}
                          onValueChange={v => setGenre(def.genreKey!, v as string)}
                        >
                          <SelectTrigger className="h-8 text-xs text-gray-500">
                            <SelectValue placeholder="Main genre?" />
                          </SelectTrigger>
                          <SelectContent>
                            {def.genres.map(g => (
                              <SelectItem key={g.value} value={g.value} className="text-xs">
                                {g.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bedtime multi-select */}
              <div className="space-y-2 pt-3 border-t">
                <p className="text-xs text-gray-500 font-medium">Used right before sleep?</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(BEDTIME_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleBedtime(key)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        bedtime.has(key)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* State */}
          <Card>
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">
                Today&apos;s State (1 Low → 5 High)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScaleRow label="Mood"    value={mood}    onChange={setMood} />
              <ScaleRow label="Stress"  value={stress}  onChange={setStress} />
              <ScaleRow label="Fatigue" value={fatigue} onChange={setFatigue} />
              <ScaleRow label="Focus"   value={focus}   onChange={setFocus} />
            </CardContent>
          </Card>

          {/* Day Type */}
          <div className="space-y-1">
            <Label>Day Type</Label>
            <Select onValueChange={v => setDayType(v as string)}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal day</SelectItem>
                <SelectItem value="deadline">Assignment deadline</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
                <SelectItem value="social">Social activity</SelectItem>
                <SelectItem value="parttime">Part-time job</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Personal Probe (Week 4+) */}
          {probeLabels.some(l => l) && (
            <Card className="border-purple-200 bg-purple-50/30">
              <CardHeader className="pb-1 pt-4">
                <CardTitle className="text-xs text-purple-500 uppercase tracking-wide">Personal Probe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {probeLabels.map((label, i) => label ? (
                  <div key={i} className="space-y-1">
                    <p className="text-sm text-gray-700">{i + 1}. {label}</p>
                    <Input type="number" step="0.1" placeholder="Enter value"
                      value={probeValues[i]}
                      onChange={e => setProbeValues(prev => prev.map((v, idx) => idx === i ? e.target.value : v))} />
                  </div>
                ) : null)}
              </CardContent>
            </Card>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Saving…' : 'Save Log'}
          </Button>
        </form>
      </main>
    </div>
  )
}
