import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditForm from './edit-form'

export default async function EditLogPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: log }, { data: profile }] = await Promise.all([
    supabase.from('daily_logs').select('*').eq('student_id', user.id).eq('log_date', date).single(),
    supabase.from('profiles').select('probe_label_1, probe_label_2, probe_label_3, probe_label_4, probe_label_5').eq('id', user.id).single(),
  ])

  if (!log) redirect('/dashboard')

  return <EditForm log={log} probeLabels={[
    profile?.probe_label_1 ?? null,
    profile?.probe_label_2 ?? null,
    profile?.probe_label_3 ?? null,
    profile?.probe_label_4 ?? null,
    profile?.probe_label_5 ?? null,
  ]} />
}
