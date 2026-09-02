import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AppHeader from '@/components/app-header'
import SurveyForm from '@/app/survey/survey-form'
import { getLocale } from '@/lib/i18n-server'
import { pick } from '@/lib/i18n'

const WEEKS = [
  { week: 1,  topic: ['Orientation: Recording My Media Life', '오리엔테이션: 나의 미디어 생활 기록하기'], phase: 'Individual' },
  { week: 2,  topic: ['Building Good Media Data', '좋은 미디어 데이터 만들기'], phase: 'Individual' },
  { week: 3,  topic: ['Visualizing My Daily Life', '나의 일상 시각화하기'], phase: 'Individual' },
  { week: 4,  topic: ['Designing My Personal Probe', '나만의 탐구 변수 설계하기'], phase: 'Individual' },
  { week: 5,  topic: ['Machine Learning Blueprint', '머신러닝 청사진'], phase: 'Individual' },
  { week: 6,  topic: ['Regression: What Affects My State?', '회귀분석: 무엇이 나의 상태에 영향을 줄까?'], phase: 'Individual' },
  { week: 7,  topic: ['Classification: Labeling My Days', '분류: 나의 하루에 라벨 붙이기'], phase: 'Individual→Team' },
  { week: 8,  topic: ['Clustering: Finding My Life Modes', '군집화: 나의 생활 유형 찾기'], phase: 'Team Prep' },
  { week: 9,  topic: ['Apriori & Team Kick-off', 'Apriori와 팀 활동 시작'], phase: 'Team' },
  { week: 10, topic: ['From Individual to Class', '개인에서 학급으로'], phase: 'Team' },
  { week: 11, topic: ['Same Situation, Different Responses', '같은 상황, 다른 반응'], phase: 'Team' },
  { week: 12, topic: ['Data Freeze & Comparison Prep', '데이터 확정 및 비교 준비'], phase: 'Team' },
  { week: 13, topic: ['Class vs. KISDI Media Panel', '수업 데이터와 KISDI 미디어 패널 비교'], phase: 'Team' },
  { week: 14, topic: ['Building the Human-Centered Dashboard', '사람 중심 대시보드 만들기'], phase: 'Team' },
  { week: 15, topic: ['Final Presentation', '최종 발표'], phase: 'Final' },
]

const PHASE_LABEL: Record<string, [string, string]> = {
  Individual: ['Individual', '개인'],
  'Individual→Team': ['Individual→Team', '개인→팀'],
  'Team Prep': ['Team Prep', '팀 준비'],
  Team: ['Team', '팀'],
  Final: ['Final', '최종'],
}

const PHASE_COLOR: Record<string, string> = {
  'Individual':       'bg-blue-50 text-blue-700',
  'Individual→Team':  'bg-purple-50 text-purple-700',
  'Team Prep':        'bg-orange-50 text-orange-700',
  'Team':             'bg-green-50 text-green-700',
  'Final':            'bg-red-50 text-red-700',
}

function getCurrentWeek() {
  const start = new Date('2026-09-01')
  const today = new Date()
  const days = Math.floor((today.getTime() - start.getTime()) / 86400000)
  if (days < 0) return 0
  return Math.min(Math.floor(days / 7) + 1, 15)
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const locale = await getLocale()
  const t = <T,>(english: T, korean: T) => pick(locale, english, korean)
  const { tab } = await searchParams
  const isProfileTab = tab === 'profile'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('anonymous_id, is_admin, survey_completed_at')
    .eq('id', user.id)
    .single()

  // Fetch survey data only when profile tab is active
  let surveyProfile = null
  if (isProfileTab) {
    const { data } = await supabase
      .from('profiles')
      .select(`
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
    surveyProfile = data
  }

  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title, content, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: logs } = await supabase
    .from('daily_logs')
    .select('log_date')
    .eq('student_id', user.id)

  const currentWeek = getCurrentWeek()
  const logCount = logs?.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader anonymousId={profile?.anonymous_id} isAdmin={profile?.is_admin ?? false} />

      {/* Tab bar */}
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 flex gap-0">
          <Link
            href="/home"
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              !isProfileTab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('Course', '수업')}
          </Link>
          <Link
            href="/home?tab=profile"
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              isProfileTab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t('Profile Survey', '프로필 설문')}
            {!profile?.survey_completed_at && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </Link>
        </div>
      </div>

      {isProfileTab ? (
        <SurveyForm profile={surveyProfile} />
      ) : (
        <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

          {/* Course info */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              ML for Understanding Humans and Society
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t('SKKU · Fall 2026 · Prof. Changjun Lee', '성균관대학교 · 2026년 가을학기 · 이창준 교수')}</p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-2xl font-bold">{logCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('Days logged', '기록한 날')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3">
                <p className="text-2xl font-bold">
                  {currentWeek === 0 ? '—' : t(`W${currentWeek}`, `${currentWeek}주차`)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{t('Current week', '현재 주차')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 flex flex-col justify-between h-full">
                <Link href="/log/new"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  {t('Log Today', '오늘 기록하기')} →
                </Link>
                <Link href="/team"
                  className="text-sm text-gray-500 hover:text-gray-700 mt-1 block">
                  {t('My Team', '내 팀')} →
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Current week */}
          {currentWeek === 0 ? (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="py-4">
                <p className="text-sm font-medium text-blue-800">
                  {t('Semester starts September 1, 2026', '학기는 2026년 9월 1일에 시작합니다')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {t('Start logging your daily data from Day 1!', '첫날부터 매일 데이터를 기록해보세요!')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200 ring-1 ring-blue-200">
              <CardHeader className="pb-1">
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">{t('This Week', '이번 주')}</p>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{t('Week', '주차')} {currentWeek} · {t(...WEEKS[currentWeek - 1].topic as [string, string])}</p>
                <Badge className={`mt-2 text-xs ${PHASE_COLOR[WEEKS[currentWeek - 1].phase]}`}>
                  {t(...PHASE_LABEL[WEEKS[currentWeek - 1].phase])}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Announcements */}
          {announcements && announcements.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t('Announcements', '공지사항')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id} className="border-b last:border-0 pb-3 last:pb-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.content && <p className="text-sm text-gray-500 mt-0.5">{a.content}</p>}
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(a.created_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 15-week schedule */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('Course Schedule', '수업 일정')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {WEEKS.map(w => (
                  <div key={w.week}
                    className={`flex items-center gap-3 px-2 py-1.5 rounded-md text-sm ${
                      w.week === currentWeek ? 'bg-blue-50 font-medium' : ''
                    }`}
                  >
                    <span className={`w-6 text-right text-xs shrink-0 ${
                      w.week === currentWeek ? 'text-blue-600 font-bold' : 'text-gray-300'
                    }`}>
                      {w.week}
                    </span>
                    <span className={w.week === currentWeek ? 'text-blue-800' : 'text-gray-600'}>
                      {t(...w.topic as [string, string])}
                    </span>
                    <span className={`ml-auto text-xs shrink-0 px-1.5 py-0.5 rounded ${PHASE_COLOR[w.phase]}`}>
                      {t(...PHASE_LABEL[w.phase])}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      )}
    </div>
  )
}
