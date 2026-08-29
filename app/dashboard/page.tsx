import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DashboardCharts from './charts'
import ProbeSetup from './probe-setup'
import AppHeader from '@/components/app-header'

const DAY_TYPE: Record<string, string> = {
  normal:   'Normal day',
  deadline: 'Assignment deadline',
  exam:     'Exam',
  social:   'Social activity',
  parttime: 'Part-time job',
  other:    'Other',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('anonymous_id, is_admin, probe_label_1, probe_label_2, probe_label_3, probe_label_4, probe_label_5, survey_completed_at')
    .eq('id', user.id)
    .single()

  const today = new Date().toLocaleDateString('sv') // YYYY-MM-DD

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('student_id', user.id)
    .order('log_date', { ascending: false })
    .limit(14)

  const todayLog = logs?.find(l => l.log_date === today)
  const logCount = logs?.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader anonymousId={profile?.anonymous_id} isAdmin={profile?.is_admin ?? false} />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Survey banner */}
        {!profile?.survey_completed_at && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-amber-800">프로필 설문을 완료해주세요</p>
              <p className="text-xs text-amber-600 mt-0.5">인구통계·기기·서비스 이용 현황을 한 번만 입력하면 됩니다.</p>
            </div>
            <Link href="/home?tab=profile">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 shrink-0">시작하기</Button>
            </Link>
          </div>
        )}

        {/* Today */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today&apos;s Log · {today}</CardTitle>
          </CardHeader>
          <CardContent>
            {todayLog ? (
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓ Done</Badge>
                <span className="text-sm text-gray-600">
                  Sleep {todayLog.sleep_hours ?? '-'}h · Media {(
                    (todayLog.media_tv_ott ?? 0) + (todayLog.media_longform ?? 0) +
                    (todayLog.media_shortform ?? 0) + (todayLog.media_sns ?? 0) +
                    (todayLog.media_messenger ?? 0) + (todayLog.media_game ?? 0) +
                    (todayLog.media_music ?? 0) + (todayLog.media_news ?? 0) +
                    (todayLog.media_webtoon ?? 0) + (todayLog.media_reading ?? 0) +
                    (todayLog.media_ai ?? 0)
                  ).toFixed(1)}h · Mood {todayLog.mood ?? '-'}/5 · Focus {todayLog.focus ?? '-'}/5
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Not logged yet
                </Badge>
                <Link href="/log/new">
                  <Button size="sm">Log Today</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold">{logCount}</p>
              <p className="text-sm text-gray-500">Days logged</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold">
                {logs && logs.length > 0
                  ? (logs.reduce((s, l) => s + (l.mood ?? 0), 0) / logs.length).toFixed(1)
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Avg. mood (1–5)</p>
            </CardContent>
          </Card>
        </div>

        {/* Personal Probe setup */}
        <ProbeSetup initial={[
          profile?.probe_label_1 ?? null,
          profile?.probe_label_2 ?? null,
          profile?.probe_label_3 ?? null,
          profile?.probe_label_4 ?? null,
          profile?.probe_label_5 ?? null,
        ]} />

        {/* Charts */}
        <DashboardCharts logs={logs ?? []} />

        {/* Recent logs table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">Recent Logs</CardTitle>
              <Link href="/log/new">
                <Button variant="outline" size="sm">+ New Log</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {logCount === 0 ? (
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
                    {logs!.map(log => (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-2">{log.log_date}</td>
                        <td className="text-center py-2">{log.sleep_hours ?? '-'}h</td>
                        <td className="text-center py-2">{(
                          (log.media_tv_ott ?? 0) + (log.media_longform ?? 0) +
                          (log.media_shortform ?? 0) + (log.media_sns ?? 0) +
                          (log.media_messenger ?? 0) + (log.media_game ?? 0) +
                          (log.media_music ?? 0) + (log.media_news ?? 0) +
                          (log.media_webtoon ?? 0) + (log.media_reading ?? 0) +
                          (log.media_ai ?? 0)
                        ).toFixed(1)}h</td>
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
