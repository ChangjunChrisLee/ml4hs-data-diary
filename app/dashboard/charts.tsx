'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, BarChart, Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Log = {
  log_date: string
  sleep_hours: number | null
  study_hours: number | null
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
  mood: number | null
  stress: number | null
  fatigue: number | null
  focus: number | null
}

function totalMedia(l: Log) {
  return (l.media_tv_ott ?? 0) + (l.media_longform ?? 0) + (l.media_shortform ?? 0)
    + (l.media_sns ?? 0) + (l.media_messenger ?? 0) + (l.media_game ?? 0)
    + (l.media_music ?? 0) + (l.media_news ?? 0) + (l.media_webtoon ?? 0)
    + (l.media_reading ?? 0)
}

function shortDate(d: string) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

const C = {
  sleep: '#6366f1', study: '#22c55e', media: '#f97316',
  mood: '#6366f1', stress: '#ef4444', fatigue: '#f97316', focus: '#22c55e',
  tv_ott: '#3b82f6', longform: '#f43f5e', shortform: '#a855f7',
  sns: '#14b8a6', messenger: '#06b6d4', game: '#f59e0b',
  music: '#10b981', news: '#6b7280', webtoon: '#ec4899', reading: '#84cc16',
}

export default function DashboardCharts({ logs }: { logs: Log[] }) {
  if (logs.length < 2) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-gray-400">
          Charts will appear after 2 or more days of logs.
        </CardContent>
      </Card>
    )
  }

  const data = [...logs].reverse().map(l => ({
    date:        shortDate(l.log_date),
    Sleep:       l.sleep_hours,
    Study:       l.study_hours,
    Media:       totalMedia(l) || null,
    Mood:        l.mood,
    Stress:      l.stress,
    Fatigue:     l.fatigue,
    Focus:       l.focus,
    'TV/OTT':    l.media_tv_ott,
    'Long-form': l.media_longform,
    'Shorts':    l.media_shortform,
    'SNS':       l.media_sns,
    'Messenger': l.media_messenger,
    'Games':     l.media_game,
    'Music':     l.media_music,
    'News':      l.media_news,
    'Webtoon':   l.media_webtoon,
    'Reading':   l.media_reading,
  }))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Time Trends (hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Sleep" stroke={C.sleep} dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="Study" stroke={C.study} dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="Media" stroke={C.media} dot={false} strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Media Breakdown (hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="TV/OTT"    stackId="a" fill={C.tv_ott}    />
              <Bar dataKey="Long-form" stackId="a" fill={C.longform}   />
              <Bar dataKey="Shorts"    stackId="a" fill={C.shortform}  />
              <Bar dataKey="SNS"       stackId="a" fill={C.sns}        />
              <Bar dataKey="Messenger" stackId="a" fill={C.messenger}  />
              <Bar dataKey="Games"     stackId="a" fill={C.game}       />
              <Bar dataKey="Music"     stackId="a" fill={C.music}      />
              <Bar dataKey="News"      stackId="a" fill={C.news}       />
              <Bar dataKey="Webtoon"   stackId="a" fill={C.webtoon}    />
              <Bar dataKey="Reading"   stackId="a" fill={C.reading}    />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">State Trends (1–5)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
              <ReferenceLine y={3} stroke="#e5e7eb" strokeDasharray="4 4" />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Mood"    stroke={C.mood}    dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="Stress"  stroke={C.stress}  dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="Fatigue" stroke={C.fatigue} dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="Focus"   stroke={C.focus}   dot={false} strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
