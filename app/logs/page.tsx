import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AppHeader from '@/components/app-header'

const DAY_TYPE: Record<string, string> = {
  normal: 'Normal day',
  deadline: 'Assignment deadline',
  exam: 'Exam',
  social: 'Social activity',
  parttime: 'Part-time job',
  other: 'Other',
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
            <h1 className="text-xl font-semibold text-gray-900">All Logs</h1>
            <p className="text-sm text-gray-500 mt-1">
              {logs?.length ?? 0} total {(logs?.length ?? 0) === 1 ? 'record' : 'records'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Back</Button>
            </Link>
            <Link href="/log/new">
              <Button size="sm">+ New Log</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Diary History</CardTitle>
          </CardHeader>
          <CardContent>
            {!logs || logs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No logs yet. Start tracking your day!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b text-xs">
                      <th className="text-left pb-2 font-normal">Date</th>
                      <th className="text-center pb-2 font-normal">Sleep</th>
                      <th className="text-center pb-2 font-normal">Media</th>
                      <th className="text-center pb-2 font-normal">Mood</th>
                      <th className="text-center pb-2 font-normal">Stress</th>
                      <th className="text-center pb-2 font-normal">Focus</th>
                      <th className="text-left pb-2 font-normal">Type</th>
                      <th className="pb-2 font-normal"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2">{log.log_date}</td>
                        <td className="text-center py-2">{log.sleep_hours ?? '-'}h</td>
                        <td className="text-center py-2">{totalMedia(log).toFixed(1)}h</td>
                        <td className="text-center py-2">{log.mood ?? '-'}</td>
                        <td className="text-center py-2">{log.stress ?? '-'}</td>
                        <td className="text-center py-2">{log.focus ?? '-'}</td>
                        <td className="py-2 text-gray-400 text-xs">
                          {DAY_TYPE[log.day_type] ?? log.day_type ?? '-'}
                        </td>
                        <td className="py-2 text-right">
                          <Link href={`/log/${log.log_date}/edit`}
                            className="text-xs text-blue-500 hover:text-blue-700">
                            Edit
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
