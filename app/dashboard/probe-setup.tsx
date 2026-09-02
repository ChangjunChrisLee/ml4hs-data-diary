'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      setErrors(prev => prev.map((e, idx) => idx === i ? error.message : e))
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
          Personal Probe <span className="text-purple-300 font-normal normal-case">· up to 5</span>
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
                    placeholder={EXAMPLES[i]}
                    value={slot.input}
                    onChange={e => setInput(i, e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') save(i) }}
                    autoFocus={slot.editing}
                    className="text-sm"
                  />
                  {errors[i] && <p className="text-xs text-red-500">{errors[i]}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" disabled={saving === i || !slot.input.trim()} onClick={() => save(i)}>
                      {saving === i ? 'Saving…' : 'Save'}
                    </Button>
                    {slot.label && (
                      <Button size="sm" variant="ghost" onClick={() => cancelEdit(i)}>Cancel</Button>
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
                    Edit
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openEdit(i)}
                  className="flex-1 text-left text-sm text-gray-400 hover:text-purple-500 pt-1.5 transition-colors"
                >
                  {isFirst ? '+ Add your first probe variable…' : `+ Add probe ${num}…`}
                </button>
              )}
            </div>
          )
        })}

        <p className="text-xs text-gray-400 pt-1">
          Each probe is logged daily alongside your media diary.
          Design one when you spot a pattern you want to track more closely.
        </p>
      </CardContent>
    </Card>
  )
}
