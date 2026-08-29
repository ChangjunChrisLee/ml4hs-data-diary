'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ── Option lists ─────────────────────────────────────────────────────────────

const OTT_OPTS   = [
  { value: 'netflix',          label: 'Netflix' },
  { value: 'tving',            label: 'Tving' },
  { value: 'wavve',            label: 'Wavve' },
  { value: 'disney_plus',      label: 'Disney+' },
  { value: 'coupang_play',     label: '쿠팡플레이' },
  { value: 'apple_tv',         label: 'Apple TV+' },
  { value: 'youtube_premium',  label: 'YouTube Premium' },
  { value: 'other',            label: '기타' },
]
const MUSIC_OPTS = [
  { value: 'melon',         label: 'Melon' },
  { value: 'spotify',       label: 'Spotify' },
  { value: 'apple_music',   label: 'Apple Music' },
  { value: 'youtube_music', label: 'YouTube Music' },
  { value: 'bugs',          label: 'Bugs' },
  { value: 'flo',           label: 'FLO' },
  { value: 'genie',         label: '지니' },
  { value: 'other',         label: '기타' },
]
const SNS_OPTS   = [
  { value: 'instagram',  label: 'Instagram' },
  { value: 'youtube',    label: 'YouTube' },
  { value: 'tiktok',     label: 'TikTok' },
  { value: 'x_twitter',  label: 'X (Twitter)' },
  { value: 'facebook',   label: 'Facebook' },
  { value: 'threads',    label: 'Threads' },
  { value: 'naver_blog', label: '네이버 블로그·카페' },
  { value: 'other',      label: '기타' },
]
const AI_OPTS    = [
  { value: 'chatgpt',    label: 'ChatGPT' },
  { value: 'claude',     label: 'Claude' },
  { value: 'gemini',     label: 'Gemini' },
  { value: 'copilot',    label: 'Copilot' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'clovax',     label: 'ClovaX' },
  { value: 'grok',       label: 'Grok' },
  { value: 'other',      label: '기타' },
]
const AI_PAID_OPTS = [
  { key: 'ai_paid_chatgpt',   label: 'ChatGPT Plus' },
  { key: 'ai_paid_claude',    label: 'Claude Pro·Max' },
  { key: 'ai_paid_gemini',    label: 'Gemini Advanced' },
  { key: 'ai_paid_copilot',   label: 'Copilot Pro' },
  { key: 'ai_paid_perplexity',label: 'Perplexity Pro' },
  { key: 'ai_paid_other',     label: '기타' },
]
const DEVICE_OPTS = [
  { key: 'owns_smartphone',   label: '스마트폰' },
  { key: 'owns_tablet',       label: '태블릿' },
  { key: 'owns_pc_laptop',    label: 'PC·노트북' },
  { key: 'owns_smart_tv',     label: '스마트TV' },
  { key: 'owns_ebook_reader', label: 'e-book 리더' },
  { key: 'owns_console',      label: '게임기' },
]

const RANK_LABELS = ['①', '②', '③']

// ── Sub-components ────────────────────────────────────────────────────────────

function RankPicker({ opts, ranks, onChange }: {
  opts: { value: string; label: string }[]
  ranks: [string, string, string]
  onChange: (r: [string, string, string]) => void
}) {
  function handleClick(value: string) {
    const idx = ranks.indexOf(value)
    if (idx >= 0) {
      const next = ranks.filter((_, i) => i !== idx)
      onChange([next[0] ?? '', next[1] ?? '', ''] as [string, string, string])
    } else {
      const slot = ranks.indexOf('')
      if (slot < 0) return
      const next = [...ranks] as [string, string, string]
      next[slot] = value
      onChange(next)
    }
  }
  const filled = ranks.filter(r => r).length
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {opts.map(opt => {
          const rankIdx = ranks.indexOf(opt.value)
          const ranked = rankIdx >= 0
          return (
            <button key={opt.value} type="button" onClick={() => handleClick(opt.value)}
              className={`px-2.5 py-1 rounded-full text-xs border transition-colors flex items-center gap-1 ${
                ranked
                  ? 'bg-blue-600 text-white border-blue-600'
                  : filled >= 3
                    ? 'bg-white text-gray-300 border-gray-100 cursor-not-allowed'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}>
              {ranked && <span className="font-bold text-[10px]">{RANK_LABELS[rankIdx]}</span>}
              {opt.label}
            </button>
          )
        })}
      </div>
      {filled > 0 && (
        <p className="text-xs text-gray-400">
          {ranks.map((r, i) => r ? `${RANK_LABELS[i]} ${opts.find(o => o.value === r)?.label}` : null).filter(Boolean).join('  ')}
        </p>
      )}
    </div>
  )
}

function PillSelect({ opts, value, onChange }: {
  opts: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map(opt => (
        <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
            value === opt.value
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
          }`}>{opt.label}</button>
      ))}
    </div>
  )
}

function MultiPill({ opts, selected, onToggle }: {
  opts: { key: string; label: string }[]
  selected: Set<string>
  onToggle: (key: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {opts.map(opt => (
        <button key={opt.key} type="button" onClick={() => onToggle(opt.key)}
          className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
            selected.has(opt.key)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
          }`}>{opt.label}</button>
      ))}
    </div>
  )
}

// Compact Likert row — max controls number of buttons
function LikertRow({ label, value, max = 5, min = 1, onChange }: {
  label: string; value: number; max?: number; min?: number; onChange: (v: number) => void
}) {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  const compact = range.length > 6
  return (
    <div className="flex items-start gap-3">
      <span className="flex-1 text-xs text-gray-700 leading-snug pt-1">{label}</span>
      <div className="flex gap-1 shrink-0">
        {range.map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`${compact ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs'} rounded font-medium transition-colors ${
              value === n ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>{n}</button>
        ))}
      </div>
    </div>
  )
}

function ScaleRow({ label, sub, value, onChange }: {
  label: string; sub: string; value: number; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-gray-700">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
              value === n ? 'bg-blue-600 text-white border-blue-600'
                         : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
            }`}>{n}</button>
        ))}
      </div>
    </div>
  )
}

function ScaleHint({ lo, hi }: { lo: string; hi: string }) {
  return (
    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
      <span>{lo}</span><span>{hi}</span>
    </div>
  )
}

// ── Profile type ──────────────────────────────────────────────────────────────

type Profile = {
  gender?: string | null; birth_year?: number | null; school_year?: string | null
  major_field?: string | null; residence?: string | null
  owns_smartphone?: boolean | null; owns_tablet?: boolean | null
  owns_pc_laptop?: boolean | null; owns_smart_tv?: boolean | null
  owns_ebook_reader?: boolean | null; owns_console?: boolean | null
  ott_rank_1?: string | null; ott_rank_2?: string | null; ott_rank_3?: string | null
  music_rank_1?: string | null; music_rank_2?: string | null; music_rank_3?: string | null
  sns_rank_1?: string | null; sns_rank_2?: string | null; sns_rank_3?: string | null
  ai_rank_1?: string | null; ai_rank_2?: string | null; ai_rank_3?: string | null
  ai_paid_chatgpt?: boolean | null; ai_paid_claude?: boolean | null
  ai_paid_gemini?: boolean | null; ai_paid_copilot?: boolean | null
  ai_paid_perplexity?: boolean | null; ai_paid_other?: boolean | null
  attitude_importance?: number | null; attitude_algorithm?: number | null
  attitude_control?: number | null; attitude_regret?: number | null
  life_sat_personal?: number | null; life_sat_relational?: number | null; life_sat_collective?: number | null
  swls_1?: number | null; swls_2?: number | null; swls_3?: number | null; swls_4?: number | null; swls_5?: number | null
  emotion_joyful?: number | null; emotion_happy?: number | null; emotion_calm?: number | null
  emotion_annoyed?: number | null; emotion_negative?: number | null; emotion_helpless?: number | null
  rse_1?: number | null; rse_2?: number | null; rse_3?: number | null; rse_4?: number | null; rse_5?: number | null
  rse_6?: number | null; rse_7?: number | null; rse_8?: number | null; rse_9?: number | null; rse_10?: number | null
  innov_func_1?: number | null; innov_func_2?: number | null; innov_func_3?: number | null; innov_func_4?: number | null
  innov_hedonic_1?: number | null; innov_hedonic_2?: number | null; innov_hedonic_3?: number | null; innov_hedonic_4?: number | null
  innov_social_1?: number | null; innov_social_2?: number | null; innov_social_3?: number | null; innov_social_4?: number | null
  innov_cognitive_1?: number | null; innov_cognitive_2?: number | null; innov_cognitive_3?: number | null; innov_cognitive_4?: number | null
  survey_completed_at?: string | null
}

// ── Form ──────────────────────────────────────────────────────────────────────

export default function SurveyForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const p = profile ?? {}
  const [language, setLanguage] = useState<'en' | 'ko'>('en')
  const ko = language === 'ko'

  const serviceOpts = (opts: { value: string; label: string }[]) => opts.map(opt => ({
    ...opt,
    label: opt.value === 'other' ? (ko ? '기타' : 'Other') : opt.label,
  }))
  const deviceOpts = DEVICE_OPTS.map(opt => ({
    ...opt,
    label: ({
      owns_smartphone: ko ? '스마트폰' : 'Smartphone',
      owns_tablet: ko ? '태블릿' : 'Tablet',
      owns_pc_laptop: ko ? 'PC·노트북' : 'PC / Laptop',
      owns_smart_tv: ko ? '스마트TV' : 'Smart TV',
      owns_ebook_reader: ko ? 'e-book 리더' : 'E-book reader',
      owns_console: ko ? '게임기' : 'Game console',
    } as Record<string, string>)[opt.key],
  }))
  const paidAiOpts = AI_PAID_OPTS.map(opt => ({
    ...opt,
    label: opt.key === 'ai_paid_other' ? (ko ? '기타' : 'Other') : opt.label,
  }))

  // Demographics
  const [gender, setGender]         = useState(p.gender ?? '')
  const [birthYear, setBirthYear]   = useState(p.birth_year?.toString() ?? '')
  const [schoolYear, setSchoolYear] = useState(p.school_year ?? '')
  const [majorField, setMajorField] = useState(p.major_field ?? '')
  const [residence, setResidence]   = useState(p.residence ?? '')

  // Devices
  const [devices, setDevices] = useState<Set<string>>(new Set([
    ...(p.owns_smartphone   ? ['owns_smartphone']   : []),
    ...(p.owns_tablet       ? ['owns_tablet']       : []),
    ...(p.owns_pc_laptop    ? ['owns_pc_laptop']    : []),
    ...(p.owns_smart_tv     ? ['owns_smart_tv']     : []),
    ...(p.owns_ebook_reader ? ['owns_ebook_reader'] : []),
    ...(p.owns_console      ? ['owns_console']      : []),
  ]))

  // Service ranks
  const [ottRanks,   setOttRanks]   = useState<[string,string,string]>([p.ott_rank_1   ?? '', p.ott_rank_2   ?? '', p.ott_rank_3   ?? ''])
  const [musicRanks, setMusicRanks] = useState<[string,string,string]>([p.music_rank_1 ?? '', p.music_rank_2 ?? '', p.music_rank_3 ?? ''])
  const [snsRanks,   setSnsRanks]   = useState<[string,string,string]>([p.sns_rank_1   ?? '', p.sns_rank_2   ?? '', p.sns_rank_3   ?? ''])
  const [aiRanks,    setAiRanks]    = useState<[string,string,string]>([p.ai_rank_1    ?? '', p.ai_rank_2    ?? '', p.ai_rank_3    ?? ''])

  // AI paid
  const [aiPaid, setAiPaid] = useState<Set<string>>(new Set([
    ...(p.ai_paid_chatgpt   ? ['ai_paid_chatgpt']   : []),
    ...(p.ai_paid_claude    ? ['ai_paid_claude']    : []),
    ...(p.ai_paid_gemini    ? ['ai_paid_gemini']    : []),
    ...(p.ai_paid_copilot   ? ['ai_paid_copilot']   : []),
    ...(p.ai_paid_perplexity? ['ai_paid_perplexity']: []),
    ...(p.ai_paid_other     ? ['ai_paid_other']     : []),
  ]))

  // Media attitudes (existing)
  const [attImportance, setAttImportance] = useState(p.attitude_importance ?? 0)
  const [attAlgorithm,  setAttAlgorithm]  = useState(p.attitude_algorithm  ?? 0)
  const [attControl,    setAttControl]    = useState(p.attitude_control    ?? 0)
  const [attRegret,     setAttRegret]     = useState(p.attitude_regret     ?? 0)

  // 삶의 만족도 측면 (1–10)
  const [lifeSatPersonal,   setLifeSatPersonal]   = useState(p.life_sat_personal   ?? 0)
  const [lifeSatRelational, setLifeSatRelational] = useState(p.life_sat_relational ?? 0)
  const [lifeSatCollective, setLifeSatCollective] = useState(p.life_sat_collective ?? 0)

  // SWLS (1–7)
  const [swls, setSwls] = useState([
    p.swls_1 ?? 0, p.swls_2 ?? 0, p.swls_3 ?? 0, p.swls_4 ?? 0, p.swls_5 ?? 0,
  ])
  function setSwlsItem(i: number, v: number) { setSwls(prev => prev.map((x, idx) => idx === i ? v : x)) }

  // 감정 (1–5)
  const [emotions, setEmotions] = useState({
    joyful: p.emotion_joyful ?? 0, happy: p.emotion_happy ?? 0, calm: p.emotion_calm ?? 0,
    annoyed: p.emotion_annoyed ?? 0, negative: p.emotion_negative ?? 0, helpless: p.emotion_helpless ?? 0,
  })
  function setEmotion(key: keyof typeof emotions, v: number) { setEmotions(prev => ({ ...prev, [key]: v })) }

  // 자아존중감 (1–4)
  const [rse, setRse] = useState([
    p.rse_1 ?? 0, p.rse_2 ?? 0, p.rse_3 ?? 0, p.rse_4 ?? 0, p.rse_5 ?? 0,
    p.rse_6 ?? 0, p.rse_7 ?? 0, p.rse_8 ?? 0, p.rse_9 ?? 0, p.rse_10 ?? 0,
  ])
  function setRseItem(i: number, v: number) { setRse(prev => prev.map((x, idx) => idx === i ? v : x)) }

  // 소비자혁신성 (1–5)
  const [innov, setInnov] = useState({
    func:     [p.innov_func_1     ?? 0, p.innov_func_2     ?? 0, p.innov_func_3     ?? 0, p.innov_func_4     ?? 0],
    hedonic:  [p.innov_hedonic_1  ?? 0, p.innov_hedonic_2  ?? 0, p.innov_hedonic_3  ?? 0, p.innov_hedonic_4  ?? 0],
    social:   [p.innov_social_1   ?? 0, p.innov_social_2   ?? 0, p.innov_social_3   ?? 0, p.innov_social_4   ?? 0],
    cognitive:[p.innov_cognitive_1 ?? 0,p.innov_cognitive_2 ?? 0,p.innov_cognitive_3 ?? 0,p.innov_cognitive_4 ?? 0],
  })
  function setInnovItem(dim: keyof typeof innov, i: number, v: number) {
    setInnov(prev => ({ ...prev, [dim]: prev[dim].map((x, idx) => idx === i ? v : x) }))
  }

  const [loading, setLoading] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, key: string) {
    setter(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setSaved(false); setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: dbError } = await supabase.from('profiles').update({
      gender: gender || null,
      birth_year: birthYear ? parseInt(birthYear) : null,
      school_year: schoolYear || null,
      major_field: majorField || null,
      residence: residence || null,
      owns_smartphone:   devices.has('owns_smartphone'),
      owns_tablet:       devices.has('owns_tablet'),
      owns_pc_laptop:    devices.has('owns_pc_laptop'),
      owns_smart_tv:     devices.has('owns_smart_tv'),
      owns_ebook_reader: devices.has('owns_ebook_reader'),
      owns_console:      devices.has('owns_console'),
      ott_rank_1:   ottRanks[0]   || null, ott_rank_2:   ottRanks[1]   || null, ott_rank_3:   ottRanks[2]   || null,
      music_rank_1: musicRanks[0] || null, music_rank_2: musicRanks[1] || null, music_rank_3: musicRanks[2] || null,
      sns_rank_1:   snsRanks[0]   || null, sns_rank_2:   snsRanks[1]   || null, sns_rank_3:   snsRanks[2]   || null,
      ai_rank_1:    aiRanks[0]    || null, ai_rank_2:    aiRanks[1]    || null, ai_rank_3:    aiRanks[2]    || null,
      ai_paid_chatgpt:    aiPaid.has('ai_paid_chatgpt'),
      ai_paid_claude:     aiPaid.has('ai_paid_claude'),
      ai_paid_gemini:     aiPaid.has('ai_paid_gemini'),
      ai_paid_copilot:    aiPaid.has('ai_paid_copilot'),
      ai_paid_perplexity: aiPaid.has('ai_paid_perplexity'),
      ai_paid_other:      aiPaid.has('ai_paid_other'),
      attitude_importance: attImportance || null,
      attitude_algorithm:  attAlgorithm  || null,
      attitude_control:    attControl    || null,
      attitude_regret:     attRegret     || null,
      life_sat_personal:   lifeSatPersonal   || null,
      life_sat_relational: lifeSatRelational || null,
      life_sat_collective: lifeSatCollective || null,
      swls_1: swls[0] || null, swls_2: swls[1] || null, swls_3: swls[2] || null,
      swls_4: swls[3] || null, swls_5: swls[4] || null,
      emotion_joyful:   emotions.joyful   || null, emotion_happy:    emotions.happy    || null,
      emotion_calm:     emotions.calm     || null, emotion_annoyed:  emotions.annoyed  || null,
      emotion_negative: emotions.negative || null, emotion_helpless: emotions.helpless || null,
      rse_1:  rse[0]  || null, rse_2:  rse[1]  || null, rse_3:  rse[2]  || null,
      rse_4:  rse[3]  || null, rse_5:  rse[4]  || null, rse_6:  rse[5]  || null,
      rse_7:  rse[6]  || null, rse_8:  rse[7]  || null, rse_9:  rse[8]  || null, rse_10: rse[9] || null,
      innov_func_1:      innov.func[0]      || null, innov_func_2:      innov.func[1]      || null,
      innov_func_3:      innov.func[2]      || null, innov_func_4:      innov.func[3]      || null,
      innov_hedonic_1:   innov.hedonic[0]   || null, innov_hedonic_2:   innov.hedonic[1]   || null,
      innov_hedonic_3:   innov.hedonic[2]   || null, innov_hedonic_4:   innov.hedonic[3]   || null,
      innov_social_1:    innov.social[0]    || null, innov_social_2:    innov.social[1]    || null,
      innov_social_3:    innov.social[2]    || null, innov_social_4:    innov.social[3]    || null,
      innov_cognitive_1: innov.cognitive[0] || null, innov_cognitive_2: innov.cognitive[1] || null,
      innov_cognitive_3: innov.cognitive[2] || null, innov_cognitive_4: innov.cognitive[3] || null,
      survey_completed_at: new Date().toISOString(),
    }).eq('id', user.id)

    setLoading(false)
    if (dbError) setError(dbError.message)
    else setSaved(true)
  }

  const alreadyDone = !!p.survey_completed_at

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">{ko ? '프로필 설문' : 'Profile Survey'}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {alreadyDone
                ? (ko ? '이전에 완료한 설문입니다. 수정 후 다시 저장할 수 있습니다.' : 'You have completed this survey. You can update and save it again.')
                : (ko ? '한 번만 작성하면 됩니다. 나중에 언제든 수정 가능합니다.' : 'Complete this survey once. You can update it at any time.')}
            </p>
          </div>
          <div className="flex rounded-md border bg-white p-0.5 shrink-0" aria-label="Survey language">
            {(['en', 'ko'] as const).map(value => (
              <button key={value} type="button" onClick={() => setLanguage(value)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${language === value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
                {value === 'en' ? 'English' : '한국어'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── 인구통계 ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? '인구통계' : 'Demographics'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{ko ? '성별' : 'Gender'}</Label>
              <PillSelect opts={ko ? [{ value:'male',label:'남성'},{ value:'female',label:'여성'},{ value:'other',label:'기타·응답안함'}] : [{ value:'male',label:'Male'},{ value:'female',label:'Female'},{ value:'other',label:'Other / Prefer not to say'}]} value={gender} onChange={setGender} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{ko ? '출생연도' : 'Birth year'}</Label>
              <Input type="number" min="1990" max="2010" placeholder={ko ? '예) 2002' : 'e.g. 2002'}
                value={birthYear} onChange={e => setBirthYear(e.target.value)} className="w-32" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{ko ? '학년' : 'Year of study'}</Label>
              <PillSelect opts={ko ? [{value:'1',label:'1학년'},{value:'2',label:'2학년'},{value:'3',label:'3학년'},{value:'4',label:'4학년'},{value:'grad',label:'대학원'}] : [{value:'1',label:'1st year'},{value:'2',label:'2nd year'},{value:'3',label:'3rd year'},{value:'4',label:'4th year'},{value:'grad',label:'Graduate'}]} value={schoolYear} onChange={setSchoolYear} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{ko ? '전공계열' : 'Major field'}</Label>
              <PillSelect opts={ko ? [{value:'humanities_social',label:'인문사회'},{value:'stem',label:'이공'},{value:'arts',label:'예체능'},{value:'other',label:'기타'}] : [{value:'humanities_social',label:'Humanities / Social sciences'},{value:'stem',label:'STEM'},{value:'arts',label:'Arts / Sports'},{value:'other',label:'Other'}]} value={majorField} onChange={setMajorField} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{ko ? '거주형태' : 'Living arrangement'}</Label>
              <PillSelect opts={ko ? [{value:'family',label:'자택 (부모님과)'},{value:'dormitory',label:'기숙사'},{value:'alone',label:'자취·하숙'},{value:'other',label:'기타'}] : [{value:'family',label:'With family'},{value:'dormitory',label:'Dormitory'},{value:'alone',label:'Living independently'},{value:'other',label:'Other'}]} value={residence} onChange={setResidence} />
            </div>
          </CardContent>
        </Card>

        {/* ── 기기 보유 ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? '보유 기기 (복수 선택)' : 'Devices owned (select all)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiPill opts={deviceOpts} selected={devices} onToggle={k => toggleSet(setDevices, k)} />
          </CardContent>
        </Card>

        {/* ── 이용 서비스 순위 ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? '이용 서비스 (1·2·3순위)' : 'Services used (rank top 3)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">OTT</p>
              <RankPicker opts={serviceOpts(OTT_OPTS)} ranks={ottRanks} onChange={setOttRanks} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{ko ? '음악 스트리밍' : 'Music streaming'}</p>
              <RankPicker opts={serviceOpts(MUSIC_OPTS)} ranks={musicRanks} onChange={setMusicRanks} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">SNS</p>
              <RankPicker opts={serviceOpts(SNS_OPTS)} ranks={snsRanks} onChange={setSnsRanks} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{ko ? 'AI 서비스' : 'AI services'}</p>
              <RankPicker opts={serviceOpts(AI_OPTS)} ranks={aiRanks} onChange={setAiRanks} />
            </div>
          </CardContent>
        </Card>

        {/* ── AI 유료 구독 ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? 'AI 유료 구독 (복수 선택)' : 'Paid AI subscriptions (select all)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiPill opts={paidAiOpts} selected={aiPaid} onToggle={k => toggleSet(setAiPaid, k)} />
          </CardContent>
        </Card>

        {/* ── 삶의 만족도 측면 ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? '삶의 만족도 — 측면별 (1–10)' : 'Life satisfaction by domain (1–10)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScaleHint lo={ko ? '1 매우 불만족' : '1 Very dissatisfied'} hi={ko ? '10 매우 만족' : '10 Very satisfied'} />
            <LikertRow label={ko ? '개인적 측면 만족도' : 'Personal life satisfaction'} value={lifeSatPersonal}   max={10} onChange={setLifeSatPersonal} />
            <LikertRow label={ko ? '관계적 측면 만족도' : 'Relational life satisfaction'} value={lifeSatRelational} max={10} onChange={setLifeSatRelational} />
            <LikertRow label={ko ? '집단적 측면 만족도' : 'Collective life satisfaction'} value={lifeSatCollective} max={10} onChange={setLifeSatCollective} />
          </CardContent>
        </Card>

        {/* ── SWLS ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? '삶의 만족도 및 정신건강 (1–7)' : 'Satisfaction with Life Scale (1–7)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScaleHint lo={ko ? '1 전혀 그렇지 않다' : '1 Strongly disagree'} hi={ko ? '7 매우 그렇다' : '7 Strongly agree'} />
            {(ko ? [
              '전반적으로 볼 때 나의 삶은 나의 이상에 가깝다',
              '내 삶의 상황들은 아주 좋다',
              '나는 내 삶에 만족한다',
              '지금까지 내 삶에서 내가 원하는 중요한 것들을 이루어냈다',
              '만약 내 삶을 다시 살 수 있더라도 나는 거의 아무것도 바꾸지 않을 것이다',
            ] : [
              'In most ways, my life is close to my ideal.',
              'The conditions of my life are excellent.',
              'I am satisfied with my life.',
              'So far, I have gotten the important things I want in life.',
              'If I could live my life over, I would change almost nothing.',
            ]).map((label, i) => (
              <LikertRow key={i} label={label} value={swls[i]} max={7} onChange={v => setSwlsItem(i, v)} />
            ))}
          </CardContent>
        </Card>

        {/* ── 감정 ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? '지난 한달 동안 경험한 감정 (1–5)' : 'Emotions experienced during the past month (1–5)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScaleHint lo={ko ? '1 전혀 없음' : '1 Never'} hi={ko ? '5 매우 자주' : '5 Very often'} />
            {(ko ? ([
              ['joyful', '즐거운'], ['happy', '행복한'], ['calm', '편안한'],
              ['annoyed', '짜증나는'], ['negative', '부정적인'], ['helpless', '무기력한'],
            ] as const) : ([
              ['joyful', 'Joyful'], ['happy', 'Happy'], ['calm', 'Calm'],
              ['annoyed', 'Annoyed'], ['negative', 'Negative'], ['helpless', 'Helpless'],
            ] as const)).map(([key, label]) => (
              <LikertRow key={key} label={label} value={emotions[key]} onChange={v => setEmotion(key, v)} />
            ))}
          </CardContent>
        </Card>

        {/* ── 자아존중감 ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? '자아존중감 (1–4)' : 'Self-esteem (1–4)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScaleHint lo={ko ? '1 전혀 그렇지 않다' : '1 Strongly disagree'} hi={ko ? '4 매우 그렇다' : '4 Strongly agree'} />
            {(ko ? [
              '나는 내가 다른 사람들처럼 가치 있는 사람이라고 생각한다',
              '나는 좋은 성품을 가졌다고 생각한다',
              '나는 대체적으로 실패한 사람이라는 느낌이 든다 *',
              '나는 대부분의 다른 사람들과 같이 일을 잘 할 수가 있다',
              '나는 자랑할 것이 별로 없다 *',
              '나는 내 자신에 대하여 긍정적인 태도를 가지고 있다',
              '나는 내 자신에 대하여 대체로 만족한다',
              '나는 내 자신을 좀 더 존경할 수 있으면 좋겠다 *',
              '나는 가끔 내 자신이 쓸모없는 사람이라는 느낌이 든다 *',
              '나는 때때로 내가 좋지 않은 사람이라고 생각한다 *',
            ] : [
              'I feel that I am a person of worth, at least on an equal plane with others.',
              'I feel that I have a number of good qualities.',
              'All in all, I am inclined to feel that I am a failure. *',
              'I am able to do things as well as most other people.',
              'I feel I do not have much to be proud of. *',
              'I take a positive attitude toward myself.',
              'On the whole, I am satisfied with myself.',
              'I wish I could have more respect for myself. *',
              'I certainly feel useless at times. *',
              'At times I think I am no good at all. *',
            ]).map((label, i) => (
              <LikertRow key={i} label={label} value={rse[i]} max={4} onChange={v => setRseItem(i, v)} />
            ))}
            <p className="text-[10px] text-gray-400">{ko ? '* 역문항' : '* Reverse-coded item'}</p>
          </CardContent>
        </Card>

        {/* ── 소비자혁신성 ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? '소비자혁신성 (1–5)' : 'Consumer innovativeness (1–5)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ScaleHint lo={ko ? '1 전혀 그렇지 않다' : '1 Strongly disagree'} hi={ko ? '5 매우 그렇다' : '5 Strongly agree'} />

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500">{ko ? '기능적 혁신성' : 'Functional innovativeness'}</p>
              {(ko ? [
              '현재 사용하는 제품에 없는 새로운 기능이 추가된 신제품이 나오면 바로 구매하는 편이다',
              '기존 제품에 비해 시간을 절약해 주는 신제품이 출시되면 바로 구매하는 편이다',
              '앞으로 출시될 신제품이 현재 제품보다 편리하다면 즉시 구매하는 편이다',
              '업무를 간소화 할 수 있는 제품이 출시되면 지체 없이 바로 구매하는 편이다',
            ] : [
              'I tend to buy new products immediately when they offer functions not available in products I currently use.',
              'I tend to buy new products immediately when they save time compared with existing products.',
              'I tend to buy a new product immediately if it is more convenient than my current product.',
              'I tend to buy products that simplify my work without delay.',
            ]).map((label, i) => (
                <LikertRow key={i} label={label} value={innov.func[i]} onChange={v => setInnovItem('func', i, v)} />
              ))}
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500">{ko ? '쾌락적 혁신성' : 'Hedonic innovativeness'}</p>
              {(ko ? [
              '전에 알지 못했던 새롭고 신기한 제품을 발견하면 즐겁고 재미있어진다',
              '새롭고 신기한 제품을 갖는 것은 늘 설레고 흥분된다',
              '신기한 제품을 사용하는 것은 재밌고 기쁘다',
              '혁신적인 제품을 사용하는 것은 일상을 활기차게 해주는 자극제이다',
            ] : [
              'Discovering a new and unfamiliar product feels enjoyable and fun.',
              'Owning new and novel products is always exciting.',
              'Using novel products is fun and enjoyable.',
              'Using innovative products adds stimulating energy to my daily life.',
            ]).map((label, i) => (
                <LikertRow key={i} label={label} value={innov.hedonic[i]} onChange={v => setInnovItem('hedonic', i, v)} />
              ))}
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500">{ko ? '사회적 혁신성' : 'Social innovativeness'}</p>
              {(ko ? [
              '다른 사람들과 나를 구별해주는 제품을 좋아한다',
              '다른 사람들이 사용한 적이 없는 제품을 먼저 사용하여 보다 뛰어나고 싶다',
              '다른 사람들에게 깊은 인상을 주는 신제품 사용하는 것을 좋아한다',
              '누구라도 부러워하고 호기심 가질 만한 눈에 띄는 제품을 먼저 구매·사용하고 싶다',
            ] : [
              'I like products that distinguish me from other people.',
              'I want to be among the first to use products that others have not used.',
              'I like using new products that make a strong impression on others.',
              'I want to be the first to buy and use noticeable products that others would admire or be curious about.',
            ]).map((label, i) => (
                <LikertRow key={i} label={label} value={innov.social[i]} onChange={v => setInnovItem('social', i, v)} />
              ))}
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-gray-500">{ko ? '인지적 혁신성' : 'Cognitive innovativeness'}</p>
              {(ko ? [
              '제품 사용에 많은 지식을 필요로 하는 신제품이 출시되면 즉시 구매하는 편이다',
              '나는 논리적인 생각을 필요로 하는 신제품을 종종 사용한다',
              '생각을 많이 하고 지적 호기심을 자극하는 신제품을 즉시 사용한다',
              '신제품이 나의 분석적인 생각을 충족해 준다면 대부분 구입한다',
            ] : [
              'I tend to buy new products immediately when using them requires substantial knowledge.',
              'I often use new products that require logical thinking.',
              'I immediately use new products that require thought and stimulate intellectual curiosity.',
              'I usually buy new products when they satisfy my analytical thinking.',
            ]).map((label, i) => (
                <LikertRow key={i} label={label} value={innov.cognitive[i]} onChange={v => setInnovItem('cognitive', i, v)} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── 미디어 이용 태도 ── */}
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-xs text-gray-400 uppercase tracking-wide">{ko ? '미디어 이용 태도 (1 낮음 → 5 높음)' : 'Media-use attitudes (1 low → 5 high)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ScaleRow label={ko ? '미디어 이용이 일상에서 얼마나 중요한가?' : 'How important is media use in your daily life?'} sub={ko ? '1 = 전혀 중요하지 않음  ·  5 = 매우 중요함' : '1 = Not at all important  ·  5 = Very important'} value={attImportance} onChange={setAttImportance} />
            <ScaleRow label={ko ? '콘텐츠 선택 시 알고리즘 추천을 얼마나 따르는가?' : 'How often do you follow algorithmic recommendations when choosing content?'} sub={ko ? '1 = 거의 따르지 않음  ·  5 = 거의 항상 따름' : '1 = Almost never  ·  5 = Almost always'} value={attAlgorithm} onChange={setAttAlgorithm} />
            <ScaleRow label={ko ? '미디어 이용 시간을 스스로 조절하기 어려운가?' : 'How difficult is it to control your media-use time?'} sub={ko ? '1 = 전혀 어렵지 않음  ·  5 = 매우 어려움' : '1 = Not difficult  ·  5 = Very difficult'} value={attControl} onChange={setAttControl} />
            <ScaleRow label={ko ? '미디어 이용 후 시간을 낭비했다고 느끼는가?' : 'How often do you feel you wasted time after using media?'} sub={ko ? '1 = 거의 느끼지 않음  ·  5 = 자주 느낌' : '1 = Almost never  ·  5 = Often'} value={attRegret} onChange={setAttRegret} />
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && <p className="text-sm text-green-600 font-medium">{ko ? '저장되었습니다.' : 'Saved successfully.'}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (ko ? '저장 중…' : 'Saving…') : alreadyDone ? (ko ? '수정 저장' : 'Save changes') : (ko ? '설문 제출' : 'Submit survey')}
        </Button>
      </form>
    </main>
  )
}
