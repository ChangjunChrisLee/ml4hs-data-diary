'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, BarChart, Bar,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/components/language-provider'

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
  const { t } = useLanguage()
  if (logs.length < 2) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-gray-400">
          {t('Charts will appear after 2 or more days of logs.', '이틀 이상 기록하면 차트가 표시됩니다.')}
        </CardContent>
      </Card>
    )
  }

  const data = [...logs].reverse().map(l => ({
    date:        shortDate(l.log_date),
    [t('Sleep', '수면')]:       l.sleep_hours,
    [t('Study', '공부')]:       l.study_hours,
    [t('Media', '미디어')]:     totalMedia(l) || null,
    [t('Mood', '기분')]:        l.mood,
    [t('Stress', '스트레스')]:  l.stress,
    [t('Fatigue', '피로')]:     l.fatigue,
    [t('Focus', '집중')]:       l.focus,
    'TV/OTT':    l.media_tv_ott,
    [t('Long-form', '롱폼')]: l.media_longform,
    [t('Shorts', '숏폼')]:    l.media_shortform,
    'SNS':       l.media_sns,
    [t('Messenger', '메신저')]: l.media_messenger,
    [t('Games', '게임')]:       l.media_game,
    [t('Music', '음악')]:       l.media_music,
    [t('News', '뉴스')]:        l.media_news,
    [t('Webtoon', '웹툰')]:     l.media_webtoon,
    [t('Reading', '독서')]:     l.media_reading,
  }))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('Time Trends (hours)', '시간 추이 (시간)')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey={t('Sleep', '수면')} stroke={C.sleep} dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey={t('Study', '공부')} stroke={C.study} dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey={t('Media', '미디어')} stroke={C.media} dot={false} strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('Media Breakdown (hours)', '미디어 사용 구성 (시간)')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="TV/OTT"    stackId="a" fill={C.tv_ott}    />
              <Bar dataKey={t('Long-form', '롱폼')} stackId="a" fill={C.longform}   />
              <Bar dataKey={t('Shorts', '숏폼')}    stackId="a" fill={C.shortform}  />
              <Bar dataKey="SNS"       stackId="a" fill={C.sns}        />
              <Bar dataKey={t('Messenger', '메신저')} stackId="a" fill={C.messenger}  />
              <Bar dataKey={t('Games', '게임')}       stackId="a" fill={C.game}       />
              <Bar dataKey={t('Music', '음악')}       stackId="a" fill={C.music}      />
              <Bar dataKey={t('News', '뉴스')}        stackId="a" fill={C.news}       />
              <Bar dataKey={t('Webtoon', '웹툰')}     stackId="a" fill={C.webtoon}    />
              <Bar dataKey={t('Reading', '독서')}     stackId="a" fill={C.reading}    />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('State Trends (1–5)', '상태 추이 (1–5)')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
              <ReferenceLine y={3} stroke="#e5e7eb" strokeDasharray="4 4" />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey={t('Mood', '기분')}       stroke={C.mood}    dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey={t('Stress', '스트레스')} stroke={C.stress}  dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey={t('Fatigue', '피로')}    stroke={C.fatigue} dot={false} strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey={t('Focus', '집중')}      stroke={C.focus}   dot={false} strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
