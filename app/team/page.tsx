import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppHeader from '@/components/app-header'
import TeamList from './team-list'
import type { Team } from './team-list'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('anonymous_id, is_admin')
    .eq('id', user.id)
    .single()

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, research_question, created_at, team_members(student_id, profiles(anonymous_id))')
    .order('created_at')

  const myTeamId = teams?.find(t =>
    t.team_members.some((m: { student_id: string }) => m.student_id === user.id)
  )?.id ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader anonymousId={profile?.anonymous_id} isAdmin={profile?.is_admin ?? false} />
      <TeamList teams={(teams ?? []) as unknown as Team[]} userId={user.id} myTeamId={myTeamId} />
    </div>
  )
}
