'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/components/language-provider'
import { localizeError } from '@/lib/i18n'

type Member = {
  student_id: string
  profiles: { anonymous_id: string }
}

export type Team = {
  id: string
  name: string
  research_question: string | null
  team_members: Member[]
}

export default function TeamList({ teams, userId, myTeamId }: {
  teams: Team[]
  userId: string
  myTeamId: string | null
}) {
  const router = useRouter()
  const { locale, t } = useLanguage()
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function createTeam() {
    if (!newName.trim()) return
    setLoading('create')
    setError('')
    const supabase = createClient()

    const { data: team, error: e1 } = await supabase
      .from('teams')
      .insert({ name: newName.trim(), created_by: userId })
      .select()
      .single()

    if (e1 || !team) { setError(e1 ? localizeError(locale, e1.message, '팀을 만들지 못했습니다. 다시 시도해주세요.') : t('An error occurred.', '오류가 발생했습니다.')); setLoading(null); return }

    const { error: e2 } = await supabase
      .from('team_members')
      .insert({ team_id: team.id, student_id: userId })

    if (e2) { setError(localizeError(locale, e2.message, '팀에 참여하지 못했습니다. 다시 시도해주세요.')); setLoading(null); return }

    router.push(`/team/${team.id}`)
    router.refresh()
  }

  async function joinTeam(teamId: string) {
    setLoading(teamId)
    setError('')
    const supabase = createClient()

    const { error } = await supabase
      .from('team_members')
      .insert({ team_id: teamId, student_id: userId })

    if (error) { setError(localizeError(locale, error.message, '팀에 참여하지 못했습니다. 다시 시도해주세요.')); setLoading(null); return }

    router.push(`/team/${teamId}`)
    router.refresh()
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('Teams', '팀')}</h2>
        {!myTeamId && (
          <button
            onClick={() => setShowCreate(v => !v)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + {t('Create Team', '팀 만들기')}
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-white border rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder={t('Team name (e.g. Sleep & Focus)', '팀 이름 (예: 수면과 집중)')}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createTeam()}
            className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={createTeam}
              disabled={loading === 'create' || !newName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50 hover:bg-blue-700"
            >
              {loading === 'create' ? t('Creating...', '만드는 중...') : t('Create & Join', '만들고 참여하기')}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName('') }}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              {t('Cancel', '취소')}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {teams.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">
          {t('No teams yet. Be the first to create one!', '아직 팀이 없습니다. 첫 번째 팀을 만들어보세요!')}
        </p>
      ) : (
        <div className="space-y-3">
          {teams.map(team => {
            const count = team.team_members.length
            const isMine = team.id === myTeamId
            const isFull = count >= 5

            return (
              <div key={team.id}
                className={`bg-white border rounded-lg p-4 flex justify-between items-start gap-4 ${
                  isMine ? 'border-blue-300 ring-1 ring-blue-200' : ''
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{team.name}</span>
                    {isMine && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        {t('My Team', '내 팀')}
                      </span>
                    )}
                    {isFull && !isMine && (
                      <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                        {t('Full', '정원 마감')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {count}/5 · {team.team_members.map(m => m.profiles.anonymous_id).join(', ')}
                  </p>
                  {team.research_question && (
                    <p className="text-xs text-gray-500 italic truncate">{team.research_question}</p>
                  )}
                </div>

                <div className="shrink-0">
                  {isMine ? (
                    <a href={`/team/${team.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      {t('Open', '열기')} →
                    </a>
                  ) : !myTeamId && !isFull ? (
                    <button
                      onClick={() => joinTeam(team.id)}
                      disabled={loading === team.id}
                      className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      {loading === team.id ? t('Joining...', '참여 중...') : t('Join', '참여하기')}
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
