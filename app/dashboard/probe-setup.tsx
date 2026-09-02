'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLanguage } from '@/components/language-provider'
import { localizeError } from '@/lib/i18n'

const PROBE_KEYS = [
  'probe_label_1', 'probe_label_2', 'probe_label_3', 'probe_label_4', 'probe_label_5',
] as const

const EXAMPLES = [
  'e.g. "How hard was it to stop scrolling before bed?" (1–5)',
  'e.g. "% of content I chose vs. algorithm recommended"',
  'e.g. "Minutes until first phone check after waking up"',
  'e.g. "How satisfied was I with today\'s media use?" (1–5)',
  'e.g. "Mood change after SNS use" (−2 to +2)',
]

type ProbeSlot = { label: string; editing: boolean; input: string }

export default function ProbeSetup({ initial }: { initial: (string | null)[] }) {
  const { locale, t } = useLanguage()
  const [slots, setSlots] = useState<ProbeSlot[]>(
    initial.map(l => ({ label: l ?? '', editing: false, input: l ?? '' }))
  )
  const [saving, setSaving] = useState<number | null>(null)
  const [errors, setErrors] = useState<(string | null)[]>(Array(5).fill(null))

  function openEdit(i: number) {
    setSlots(prev => prev.map((s, idx) =>
      idx === i ? { ...s, editing: true, input: s.label } : s
    ))
  }

  function cancelEdit(i: number) {
    setSlots(prev => prev.map((s, idx) =>
      idx === i ? { ...s, editing: false, input: s.label } : s
    ))
  }

  function setInput(i: number, v: string) {
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, input: v } : s))
  }

  async function save(i: number) {
    const val = slots[i].input.trim()
    if (!val) return
    setSaving(i)
    setErrors(prev => prev.map((e, idx) => idx === i ? null : e))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ [PROBE_KEYS[i]]: val })
      .eq('id', user.id)

    if (error) {
      setErrors(prev => prev.map((e, idx) => idx === i ? localizeError(locale, error.message, '저장하지 못했습니다. 다시 시도해주세요.') : e))
    } else {
      setSlots(prev => prev.map((s, idx) =>
        idx === i ? { label: val, editing: false, input: val } : s
      ))
    }
    setSaving(null)
  }

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xs text-purple-500 uppercase tracking-wide">
          {t('Personal Probe', '개인 탐구 변수')} <span className="text-purple-300 font-normal normal-case">· {t('up to 5', '최대 5개')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {slots.map((slot, i) => {
          const num = i + 1
          const isFirst = i === 0
          const prevSet = i === 0 || slots[i - 1].label !== ''

          return (
            <div key={i} className={`flex gap-3 items-start ${!prevSet ? 'opacity-40 pointer-events-none' : ''}`}>
              <span className="mt-2 w-5 text-xs font-bold text-purple-400 shrink-0">
                {num}
              </span>

              {slot.editing ? (
                <div className="flex-1 space-y-1.5">
                  <Input
                    placeholder={locale === 'ko' ? [
                      '예: “잠들기 전 스크롤을 멈추기 얼마나 어려웠나?” (1–5)',
                      '예: 내가 선택한 콘텐츠와 알고리즘 추천 콘텐츠의 비율',
                      '예: 기상 후 처음 휴대폰을 확인하기까지 걸린 시간(분)',
                      '예: 오늘의 미디어 사용에 얼마나 만족했나? (1–5)',
                      '예: SNS 사용 후 기분 변화 (−2~+2)',
                    ][i] : EXAMPLES[i]}
                    value={slot.input}
                    onChange={e => setInput(i, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') save(i) }}
                    autoFocus={slot.editing}
                    className="text-sm"
                  />
                  {errors[i] && <p className="text-xs text-red-500">{errors[i]}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving === i || !slot.input.trim()} onClick={() => save(i)}>
                      {saving === i ? t('Saving…', '저장 중…') : t('Save', '저장')}
                    </Button>
                    {slot.label && (
                      <Button size="sm" variant="ghost" onClick={() => cancelEdit(i)}>{t('Cancel', '취소')}</Button>
                    )}
                  </div>
                </div>
              ) : slot.label ? (
                <div className="flex-1 flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-800 pt-1.5">“{slot.label}”</p>
                  <button
                    onClick={() => openEdit(i)}
                    className="text-xs text-purple-400 hover:text-purple-600 shrink-0 pt-1.5"
                  >
                    {t('Edit', '수정')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openEdit(i)}
                  className="flex-1 text-left text-sm text-gray-400 hover:text-purple-500 pt-1.5 transition-colors"
                >
                  {isFirst ? t('+ Add your first probe variable…', '+ 첫 번째 탐구 변수 추가…') : t(`+ Add probe ${num}…`, `+ 탐구 변수 ${num} 추가…`)}
                </button>
              )}
            </div>
          )
        })}

        <p className="text-xs text-gray-400 pt-1">
          {t(
            'Each probe is logged daily alongside your media diary. Design one when you spot a pattern you want to track more closely.',
            '각 탐구 변수는 미디어 다이어리와 함께 매일 기록됩니다. 더 자세히 살펴보고 싶은 패턴을 발견하면 만들어보세요.',
          )}
        </p>
      </CardContent>
    </Card>
  )
}
