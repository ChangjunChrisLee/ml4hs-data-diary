import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppHeader from '@/components/app-header'
import SurveyForm from './survey-form'

export default async function SurveyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      anonymous_id, is_admin,
      gender, birth_year, school_year, major_field, residence,
      owns_smartphone, owns_tablet, owns_pc_laptop, owns_smart_tv, owns_ebook_reader, owns_console,
      ott_rank_1, ott_rank_2, ott_rank_3,
      music_rank_1, music_rank_2, music_rank_3,
      sns_rank_1, sns_rank_2, sns_rank_3,
      ai_rank_1, ai_rank_2, ai_rank_3,
      ai_paid_chatgpt, ai_paid_claude, ai_paid_gemini, ai_paid_copilot, ai_paid_perplexity, ai_paid_other,
      attitude_importance, attitude_algorithm, attitude_control, attitude_regret,
      life_sat_personal, life_sat_relational, life_sat_collective,
      swls_1, swls_2, swls_3, swls_4, swls_5,
      emotion_joyful, emotion_happy, emotion_calm, emotion_annoyed, emotion_negative, emotion_helpless,
      rse_1, rse_2, rse_3, rse_4, rse_5, rse_6, rse_7, rse_8, rse_9, rse_10,
      innov_func_1, innov_func_2, innov_func_3, innov_func_4,
      innov_hedonic_1, innov_hedonic_2, innov_hedonic_3, innov_hedonic_4,
      innov_social_1, innov_social_2, innov_social_3, innov_social_4,
      innov_cognitive_1, innov_cognitive_2, innov_cognitive_3, innov_cognitive_4,
      survey_completed_at
    `)
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader anonymousId={profile?.anonymous_id} isAdmin={profile?.is_admin ?? false} />
      <SurveyForm profile={profile} />
    </div>
  )
}
