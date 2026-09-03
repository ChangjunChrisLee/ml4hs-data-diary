import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/app-header'
import TeamDetail from './team-detail'
import { getLocale } from '@/lib/i18n-server'
import { pick } from '@/lib/i18n'

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale()
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('anonymous_id, is_admin')
    .eq('id', user.id)
    .single()

  const { data: team } = await supabase
    .from('teams')
    .select('id, name, research_question, charter')
    .eq('id', id)
    .single()

  if (!team) redirect('/team')

  const { data: members } = await supabase
    .from('team_members')
    .select('student_id, profiles(anonymous_id)')
    .eq('team_id', id)

  const isMember = members?.some(m => m.student_id === user.id) ?? false

  const { data: posts } = await supabase
    .from('team_posts')
    .select('id, content, created_at, author_id')
    .eq('team_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader anonymousId={profile?.anonymous_id} isAdmin={profile?.is_admin ?? false} />
      <div className="max-w-2xl mx-auto px-4 pt-5 flex items-center gap-2 text-sm">
        <Link href="/team" className="text-gray-400 hover:text-gray-700">← {pick(locale, 'Teams', '팀')}</Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-700">{team.name}</span>
      </div>
      <TeamDetail
        team={team}
        members={(members ?? []) as unknown as { student_id: string; profiles: { anonymous_id: string } }[]}
        posts={posts ?? []}
        userId={user.id}
        isMember={isMember}
      />
    </div>
  )
}
