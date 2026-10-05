import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AppHeader from '@/components/app-header'
import { getLocale } from '@/lib/i18n-server'
import { pick } from '@/lib/i18n'

const DAY_TYPE: Record<string, [string, string]> = {
  normal: ['Normal day', '일반적인 날'],
  deadline: ['Assignment deadline', '과제 마감일'],
  exam: ['Exam', '시험일'],
  social: ['Social activity', '모임이 있는 날'],
  parttime: ['Part-time job', '아르바이트한 날'],
  other: ['Other', '기타'],
}

function totalMedia(log: {
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
  media_ai: number | null
}) {
  return (log.media_tv_ott ?? 0) + (log.media_longform ?? 0) +
    (log.media_shortform ?? 0) + (log.media_sns ?? 0) +
    (log.media_messenger ?? 0) + (log.media_game ?? 0) +
    (log.media_music ?? 0) + (log.media_news ?? 0) +
    (log.media_webtoon ?? 0) + (log.media_reading ?? 0) +
    (log.media_ai ?? 0)
}

export default async function LogsPage() {
  const locale = await getLocale()
  const t = <T,>(english: T, korean: T) => pick(locale, english, korean)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: logs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('anonymous_id, is_admin')
      .eq('id', user.id)
      .single(),
    supabase
      .from('daily_logs')
      .select('*')
      .eq('student_id', user.id)
      .order('log_date', { ascending: false }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader anonymousId={profile?.anonymous_id} isAdmin={profile?.is_admin ?? false} />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{t('All Logs', '전체 기록')}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {t(
                `${logs?.length ?? 0} total ${(logs?.length ?? 0) === 1 ? 'record' : 'records'}`,
                `총 ${logs?.length ?? 0}개 기록`,
              )}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <a href="/api/my-data">
              <Button variant="outline" size="sm">{t('Download CSV', 'CSV 다운로드')}</Button>
            </a>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">{t('Back', '돌아가기')}</Button>
            </Link>
            <Link href="/log/new">
              <Button size="sm">+ {t('New Log', '새 기록')}</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('Diary History', '다이어리 기록')}</CardTitle>
          </CardHeader>
          <CardContent>
            {!logs || logs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                {t('No logs yet. Start tracking your day!', '아직 기록이 없습니다. 오늘부터 기록해보세요!')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b text-xs">
                      <th className="text-left pb-2 font-normal">{t('Date', '날짜')}</th>
                      <th className="text-center pb-2 font-normal">{t('Sleep', '수면')}</th>
                      <th className="text-center pb-2 font-normal">{t('Media', '미디어')}</th>
                      <th className="text-center pb-2 font-normal">{t('Mood', '기분')}</th>
                      <th className="text-center pb-2 font-normal">{t('Stress', '스트레스')}</th>
                      <th className="text-center pb-2 font-normal">{t('Focus', '집중')}</th>
                      <th className="text-left pb-2 font-normal">{t('Type', '유형')}</th>
                      <th className="pb-2 font-normal"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2">{log.log_date}</td>
                        <td className="text-center py-2">{log.sleep_hours ?? '-'}{t('h', '시간')}</td>
                        <td className="text-center py-2">{totalMedia(log).toFixed(1)}{t('h', '시간')}</td>
                        <td className="text-center py-2">{log.mood ?? '-'}</td>
                        <td className="text-center py-2">{log.stress ?? '-'}</td>
                        <td className="text-center py-2">{log.focus ?? '-'}</td>
                        <td className="py-2 text-gray-400 text-xs">
                          {log.day_type ? t(...(DAY_TYPE[log.day_type] ?? [log.day_type, log.day_type])) : '-'}
                        </td>
                        <td className="py-2 text-right">
                          <Link href={`/log/${log.log_date}/edit`}
                            className="text-xs text-blue-500 hover:text-blue-700">
                            {t('Edit', '수정')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
