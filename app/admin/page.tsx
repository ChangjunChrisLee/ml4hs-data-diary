import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppHeader from '@/components/app-header'
import AdminClient from './admin-client'
import type { Team } from './admin-client'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('anonymous_id, is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/home')

  const { data: students } = await supabase
    .from('profiles')
    .select('id, anonymous_id, created_at')
    .order('anonymous_id')

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('student_id, log_date')

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, research_question, team_members(student_id)')
    .order('name')

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false })

  const logCountByStudent: Record<string, number> = {}
  for (const log of logs ?? []) {
    logCountByStudent[log.student_id] = (logCountByStudent[log.student_id] ?? 0) + 1
  }

  const teamByStudent: Record<string, string> = {}
  for (const team of teams ?? []) {
    for (const m of team.team_members as { student_id: string }[]) {
      teamByStudent[m.student_id] = team.name
    }
  }

  const enrichedStudents = (students ?? []).map(s => ({
    ...s,
    logCount: logCountByStudent[s.id] ?? 0,
    teamName: teamByStudent[s.id] ?? null,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader anonymousId={profile.anonymous_id} isAdmin={true} />
      <AdminClient
        students={enrichedStudents}
        teams={(teams ?? []) as unknown as Team[]}
        announcements={announcements ?? []}
      />
    </div>
  )
}
