'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

export type Log = {
  id: string
  log_date: string
  sleep_hours: number | null
  study_hours: number | null
  exercise_done: boolean | null
  media_tv_ott: number | null
  media_longform: number | null
  media_shortform: number | null
  media_sns: number | null
  media_messenger: number | null
  media_game: number | null
  media_music: number | null
  media_news: number | null
  media_webtoon: number | null
  media_reading: number | null
  genre_tv_ott: string | null
  genre_longform: string | null
  genre_shortform: string | null
  genre_game: string | null
  genre_music: string | null
  bedtime_tv_ott: boolean | null
  bedtime_longform: boolean | null
  bedtime_shortform: boolean | null
  bedtime_sns: boolean | null
  bedtime_messenger: boolean | null
  bedtime_game: boolean | null
  bedtime_music: boolean | null
  bedtime_news: boolean | null
  bedtime_webtoon: boolean | null
  bedtime_reading: boolean | null
  device_tv_ott: string | null
  device_longform: string | null
  device_shortform: string | null
  device_sns: string | null
  device_messenger: string | null
  device_game: string | null
  device_music: string | null
  device_news: string | null
  device_webtoon: string | null
  device_reading: string | null
  device_ai: string | null
  bedtime_ai: boolean | null
  media_ai: number | null
  mood: number | null
  stress: number | null
  fatigue: number | null
  focus: number | null
  day_type: string | null
  probe_value_1: number | null
  probe_value_2: number | null
  probe_value_3: number | null
  probe_value_4: number | null
  probe_value_5: number | null
}

const DEVICE_OPTS = [
  { value: 'smartphone', label: '스마트폰' },
  { value: 'tv_monitor', label: 'TV·모니터' },
  { value: 'tablet',     label: '태블릿' },
  { value: 'pc_laptop',  label: 'PC·노트북' },
  { value: 'console',    label: '게임기' },
  { value: 'ebook',      label: 'e-book 리더' },
  { value: 'other',      label: '기타' },
]

const TV_GENRES = [
  { value: 'drama_film', label: 'Drama / Film' }, { value: 'entertainment', label: 'Entertainment / Variety' },
  { value: 'sports', label: 'Sports' }, { value: 'news', label: 'News / Current Affairs' },
  { value: 'documentary', label: 'Documentary / Nature' }, { value: 'animation', label: 'Animation / Anime' },
  { value: 'other', label: 'Other' },
]
const LONGFORM_GENRES = [
  { value: 'education', label: 'Education / Tutorial' }, { value: 'entertainment', label: 'Entertainment / Variety' },
  { value: 'vlog', label: 'Vlog / Daily Life' }, { value: 'gaming', label: 'Gaming / eSports' },
  { value: 'music', label: 'Music Video' }, { value: 'talk', label: 'Talk / Commentary' },
  { value: 'other', label: 'Other' },
]
const SHORTFORM_GENRES = [
  { value: 'entertainment', label: 'Entertainment / Humor' }, { value: 'vlog', label: 'Vlog / Daily Life' },
  { value: 'dance_music', label: 'Dance / Music' }, { value: 'gaming', label: 'Gaming / eSports' },
  { value: 'beauty_fashion', label: 'Beauty / Fashion' }, { value: 'news_info', label: 'News / Info' },
  { value: 'other', label: 'Other' },
]
const GAME_GENRES = [
  { value: 'fps_action', label: 'FPS / Action' }, { value: 'rpg_adventure', label: 'RPG / Adventure' },
  { value: 'moba_strategy', label: 'MOBA / Strategy' }, { value: 'sports_racing', label: 'Sports / Racing' },
  { value: 'puzzle_casual', label: 'Puzzle / Casual' }, { value: 'simulation', label: 'Simulation / Life Sim' },
  { value: 'other', label: 'Other' },
]
const MUSIC_GENRES = [
  { value: 'pop_kpop', label: 'Pop / K-pop' }, { value: 'hiphop_rnb', label: 'Hip-hop / R&B' },
  { value: 'rock_metal', label: 'Rock / Metal' }, { value: 'classical', label: 'Classical / OST' },
  { value: 'dance_edm', label: 'Dance / EDM' }, { value: 'indie_folk', label: 'Indie / Folk' },
  { value: 'podcast', label: 'Podcast' }, { value: 'other', label: 'Other / Mixed' },
]

type GenreOpt = { value: string; label: string }
type MediaDef = { key: keyof Log; label: string; examples: string; deviceKey: string; genreKey?: string; genres?: GenreOpt[]; bedtimeKey: string }

const MEDIA_DEFS: MediaDef[] = [
  { key: 'media_tv_ott',    label: 'TV / OTT',           examples: 'Netflix, Tving, Disney+, IPTV…',    deviceKey: 'device_tv_ott',    genreKey: 'genre_tv_ott',    genres: TV_GENRES,        bedtimeKey: 'tv_ott'    },
  { key: 'media_longform',  label: 'Long-form Video',    examples: 'YouTube, Twitch, V LIVE…',          deviceKey: 'device_longform',  genreKey: 'genre_longform',  genres: LONGFORM_GENRES,  bedtimeKey: 'longform'  },
  { key: 'media_shortform', label: 'Short-form',         examples: 'TikTok, YouTube Shorts, Reels…',    deviceKey: 'device_shortform', genreKey: 'genre_shortform', genres: SHORTFORM_GENRES, bedtimeKey: 'shortform' },
  { key: 'media_sns',       label: 'SNS',                examples: 'Instagram, Facebook, X, Threads…',  deviceKey: 'device_sns',                                                               bedtimeKey: 'sns'       },
  { key: 'media_messenger', label: 'Messenger',          examples: 'KakaoTalk, WhatsApp, Telegram…',    deviceKey: 'device_messenger',                                                         bedtimeKey: 'messenger' },
  { key: 'media_game',      label: 'Games',              examples: 'Mobile, PC, Console…',              deviceKey: 'device_game',      genreKey: 'genre_game',      genres: GAME_GENRES,      bedtimeKey: 'game'      },
  { key: 'media_music',     label: 'Music',              examples: 'Spotify, Apple Music, Melon…',      deviceKey: 'device_music',     genreKey: 'genre_music',     genres: MUSIC_GENRES,     bedtimeKey: 'music'     },
  { key: 'media_news',      label: 'News',               examples: 'Online news, apps, newspapers…',    deviceKey: 'device_news',                                                              bedtimeKey: 'news'      },
  { key: 'media_webtoon',   label: 'Webtoon / Web Novel',examples: 'Naver Webtoon, Kakao Page, Ridi…',  deviceKey: 'device_webtoon',                                                           bedtimeKey: 'webtoon'   },
  { key: 'media_reading',   label: 'Reading',            examples: 'Books, e-books, PDFs…',             deviceKey: 'device_reading',                                                           bedtimeKey: 'reading'   },
  { key: 'media_ai',       label: 'AI 서비스',           examples: 'ChatGPT, Claude, Gemini, Copilot…',  deviceKey: 'device_ai',                                                                bedtimeKey: 'ai'        },
]

const BEDTIME_LABELS: Record<string, string> = {
  tv_ott: 'TV/OTT', longform: 'Long-form', shortform: 'Shorts',
  sns: 'SNS', messenger: 'Messenger', game: 'Games',
  music: 'Music', news: 'News', webtoon: 'Webtoon', reading: 'Reading', ai: 'AI',
}

function ScaleRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700 flex-1 pr-2">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
              value === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}>{n}</button>
        ))}
      </div>
    </div>
  )
}

function YesNo({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-2">
        {['yes', 'no'].map(v => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`px-4 py-1.5 rounded-lg border text-sm transition-colors ${
              value === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}>{v === 'yes' ? 'Yes' : 'No'}</button>
        ))}
      </div>
    </div>
  )
}

function numStr(v: number | null) { return v != null ? v.toString() : '' }
function boolStr(v: boolean | null) { return v === true ? 'yes' : v === false ? 'no' : '' }

function initBedtime(log: Log): Set<string> {
  const s = new Set<string>()
  if (log.bedtime_tv_ott)    s.add('tv_ott')
  if (log.bedtime_longform)  s.add('longform')
  if (log.bedtime_shortform) s.add('shortform')
  if (log.bedtime_sns)       s.add('sns')
  if (log.bedtime_messenger) s.add('messenger')
  if (log.bedtime_game)      s.add('game')
  if (log.bedtime_music)     s.add('music')
  if (log.bedtime_news)      s.add('news')
  if (log.bedtime_webtoon)   s.add('webtoon')
  if (log.bedtime_reading)   s.add('reading')
  if (log.bedtime_ai)        s.add('ai')
  return s
}

export default function EditForm({ log, probeLabels }: { log: Log; probeLabels: (string | null)[] }) {
  const router = useRouter()

  const [sleepHours, setSleepHours] = useState(numStr(log.sleep_hours))
  const [studyHours, setStudyHours] = useState(numStr(log.study_hours))
  const [exercise, setExercise]     = useState(boolStr(log.exercise_done))
  const [hours, setHoursState]      = useState<Record<string, string>>(
    Object.fromEntries(MEDIA_DEFS.map(d => [d.key, numStr(log[d.key] as number | null)]))
  )
  const [devices, setDevicesState] = useState<Record<string, string>>({
    device_tv_ott:    log.device_tv_ott    ?? '',
    device_longform:  log.device_longform  ?? '',
    device_shortform: log.device_shortform ?? '',
    device_sns:       log.device_sns       ?? '',
    device_messenger: log.device_messenger ?? '',
    device_game:      log.device_game      ?? '',
    device_music:     log.device_music     ?? '',
    device_news:      log.device_news      ?? '',
    device_webtoon:   log.device_webtoon   ?? '',
    device_reading:   log.device_reading   ?? '',
    device_ai:        log.device_ai        ?? '',
  })
  const [genres, setGenresState] = useState<Record<string, string>>({
    genre_tv_ott:    log.genre_tv_ott    ?? '',
    genre_longform:  log.genre_longform  ?? '',
    genre_shortform: log.genre_shortform ?? '',
    genre_game:      log.genre_game      ?? '',
    genre_music:     log.genre_music     ?? '',
  })
  const [bedtime, setBedtime]       = useState<Set<string>>(initBedtime(log))
  const [mood, setMood]             = useState(log.mood    ?? 0)
  const [stress, setStress]         = useState(log.stress  ?? 0)
  const [fatigue, setFatigue]       = useState(log.fatigue ?? 0)
  const [focus, setFocus]           = useState(log.focus   ?? 0)
  const [dayType, setDayType]       = useState(log.day_type ?? '')
  const [probeValues, setProbeValues] = useState([
    numStr(log.probe_value_1), numStr(log.probe_value_2), numStr(log.probe_value_3),
    numStr(log.probe_value_4), numStr(log.probe_value_5),
  ])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  function setHour(key: string, v: string) { setHoursState(p => ({ ...p, [key]: v })) }
  function setDevice(key: string, v: string) { setDevicesState(p => ({ ...p, [key]: p[key] === v ? '' : v })) }
  function setGenre(key: string, v: string) { setGenresState(p => ({ ...p, [key]: v })) }
  function toggleBedtime(key: string) {
    setBedtime(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const mediaTotal = MEDIA_DEFS.reduce((sum, d) => {
    const v = parseFloat(hours[d.key]); return sum + (isNaN(v) ? 0 : v)
  }, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    function n(v: string) { const x = parseFloat(v); return isNaN(x) ? null : x }
    function b(v: string) { return v === 'yes' ? true : v === 'no' ? false : null }

    const { error: dbError } = await supabase.from('daily_logs').update({
      sleep_hours:   n(sleepHours),
      study_hours:   n(studyHours),
      exercise_done: b(exercise),
      media_tv_ott:    n(hours.media_tv_ott),    media_longform:  n(hours.media_longform),
      media_shortform: n(hours.media_shortform),  media_sns:       n(hours.media_sns),
      media_messenger: n(hours.media_messenger),  media_game:      n(hours.media_game),
      media_music:     n(hours.media_music),      media_news:      n(hours.media_news),
      media_webtoon:   n(hours.media_webtoon),    media_reading:   n(hours.media_reading),
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
      media_ai:         n(hours.media_ai ?? ''),
      bedtime_ai:       bedtime.has('ai'),
      genre_tv_ott:    genres.genre_tv_ott    || null,
      genre_longform:  genres.genre_longform  || null,
      genre_shortform: genres.genre_shortform || null,
      genre_game:      genres.genre_game      || null,
      genre_music:     genres.genre_music     || null,
      bedtime_tv_ott:    bedtime.has('tv_ott'),    bedtime_longform:  bedtime.has('longform'),
      bedtime_shortform: bedtime.has('shortform'), bedtime_sns:       bedtime.has('sns'),
      bedtime_messenger: bedtime.has('messenger'), bedtime_game:      bedtime.has('game'),
      bedtime_music:     bedtime.has('music'),     bedtime_news:      bedtime.has('news'),
      bedtime_webtoon:   bedtime.has('webtoon'),   bedtime_reading:   bedtime.has('reading'),
      mood: mood || null, stress: stress || null, fatigue: fatigue || null, focus: focus || null,
      day_type: dayType || null,
      probe_value_1: probeLabels[0] ? n(probeValues[0]) : null,
      probe_value_2: probeLabels[1] ? n(probeValues[1]) : null,
      probe_value_3: probeLabels[2] ? n(probeValues[2]) : null,
      probe_value_4: probeLabels[3] ? n(probeValues[3]) : null,
      probe_value_5: probeLabels[4] ? n(probeValues[4]) : null,
    }).eq('id', log.id)

    if (dbError) { setError(dbError.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-700">←</button>
        <div><h1 className="font-semibold">Edit Log</h1><p className="text-sm text-gray-500">{log.log_date}</p></div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-5">

          <Card>
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">Life Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Sleep (h)</Label>
                  <Input type="number" min="0" max="24" step="0.5" value={sleepHours} onChange={e => setSleepHours(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Study (h)</Label>
                  <Input type="number" min="0" max="24" step="0.5" value={studyHours} onChange={e => setStudyHours(e.target.value)} />
                </div>
              </div>
              <YesNo label="Exercised today?" value={exercise} onChange={setExercise} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">
                Media Breakdown (h) ·{' '}
                <span className="text-blue-600 normal-case font-semibold">Total {mediaTotal.toFixed(1)} h</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <Input type="number" min="0" max="16" step="0.5"
                          value={hours[def.key]} onChange={e => setHour(def.key, e.target.value)}
                          className="w-20 text-center shrink-0" />
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
                              <SelectItem key={g.value} value={g.value} className="text-xs">{g.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 pt-3 border-t">
                <p className="text-xs text-gray-500 font-medium">Used right before sleep?</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(BEDTIME_LABELS).map(([key, label]) => (
                    <button key={key} type="button" onClick={() => toggleBedtime(key)}
                      className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                        bedtime.has(key)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-4">
              <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">Today&apos;s State (1 Low → 5 High)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScaleRow label="Mood"    value={mood}    onChange={setMood} />
              <ScaleRow label="Stress"  value={stress}  onChange={setStress} />
              <ScaleRow label="Fatigue" value={fatigue} onChange={setFatigue} />
              <ScaleRow label="Focus"   value={focus}   onChange={setFocus} />
            </CardContent>
          </Card>

          <div className="space-y-1">
            <Label>Day Type</Label>
            <Select defaultValue={dayType} onValueChange={v => setDayType(v as string)}>
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
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </form>
      </main>
    </div>
  )
}
