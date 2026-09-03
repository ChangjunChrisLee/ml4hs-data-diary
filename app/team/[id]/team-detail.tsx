'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/components/language-provider'

type Team   = { id: string; name: string; research_question: string | null; charter: string | null }
type Member = { student_id: string; profiles: { anonymous_id: string } }
type Post   = { id: string; content: string; created_at: string; author_id: string }

export default function TeamDetail({ team, members, posts: initialPosts, userId, isMember }: {
  team: Team
  members: Member[]
  posts: Post[]
  userId: string
  isMember: boolean
}) {
  const router = useRouter()
  const { locale, t } = useLanguage()

  function anonName(authorId: string) {
    return members.find(m => m.student_id === authorId)?.profiles.anonymous_id ?? t('Former member', '이전 멤버')
  }

  const [charter, setCharter]         = useState(team.charter ?? '')
  const [charterDirty, setDirty]      = useState(false)
  const [charterSaving, setSaving]    = useState(false)

  const [posts, setPosts]             = useState(initialPosts)
  const [newPost, setNewPost]         = useState('')
  const [posting, setPosting]         = useState(false)

  async function saveCharter() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('teams').update({ charter }).eq('id', team.id)
    setSaving(false)
    setDirty(false)
  }

  async function addPost() {
    if (!newPost.trim()) return
    setPosting(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('team_posts')
      .insert({ team_id: team.id, author_id: userId, content: newPost.trim() })
      .select('id, content, created_at, author_id')
      .single()
    if (data) { setPosts(prev => [data, ...prev]); setNewPost('') }
    setPosting(false)
  }

  async function deletePost(postId: string) {
    const supabase = createClient()
    await supabase.from('team_posts').delete().eq('id', postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  async function leaveTeam() {
    if (!confirm(t('Leave this team?', '이 팀에서 나가시겠습니까?'))) return
    const supabase = createClient()
    await supabase.from('team_members').delete()
      .eq('team_id', team.id).eq('student_id', userId)
    router.push('/team')
    router.refresh()
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">

      {/* Members */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">{t('Members', '멤버')} ({members.length}/5)</CardTitle>
            {isMember && (
              <button onClick={leaveTeam} className="text-xs text-red-400 hover:text-red-600">
                {t('Leave team', '팀 나가기')}
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {members.map(m => (
              <span key={m.student_id}
                className={`text-sm px-2.5 py-1 rounded-full ${
                  m.student_id === userId
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                {m.profiles.anonymous_id}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Charter */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('Team Charter', '팀 계획')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isMember ? (
            <>
              <Textarea
                placeholder={t(
                  `Write your team's research question, focus, and plan here.\n\nExample:\n- Research question: Does media use before bed affect next-day focus?\n- Focus: Sleep × Media × Focus\n- Methods: Regression, Clustering`,
                  `팀의 연구 질문, 초점, 계획을 작성하세요.\n\n예시:\n- 연구 질문: 취침 전 미디어 사용이 다음 날 집중력에 영향을 줄까?\n- 초점: 수면 × 미디어 × 집중\n- 방법: 회귀분석, 군집화`,
                )}
                value={charter}
                onChange={e => { setCharter(e.target.value); setDirty(true) }}
                rows={7}
                className="resize-none text-sm"
              />
              <Button size="sm" onClick={saveCharter} disabled={charterSaving || !charterDirty}>
                {charterSaving ? t('Saving...', '저장 중...') : t('Save Charter', '팀 계획 저장')}
              </Button>
            </>
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap min-h-[60px]">
              {charter || <span className="text-gray-400 italic">{t('No charter yet.', '아직 작성된 팀 계획이 없습니다.')}</span>}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bulletin Board */}
      {isMember ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('Board', '게시판')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('Share a link, idea, or update...', '링크, 아이디어 또는 진행 상황을 공유하세요...')}
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addPost() } }}
                className="flex-1 border rounded-md px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
              <Button size="sm" onClick={addPost} disabled={posting || !newPost.trim()}>
                {posting ? '...' : t('Post', '게시')}
              </Button>
            </div>

            {posts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                {t('No posts yet. Start the conversation!', '아직 게시물이 없습니다. 첫 이야기를 남겨보세요!')}
              </p>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id}>
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className={`font-medium ${post.author_id === userId ? 'text-blue-600' : 'text-gray-700'}`}>
                          {anonName(post.author_id)}
                        </span>
                        <span>·</span>
                        <span>
                          {new Date(post.created_at).toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {post.author_id === userId && (
                        <button onClick={() => deletePost(post.id)}
                          className="text-xs text-gray-300 hover:text-red-400">
                          {t('delete', '삭제')}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-sm text-gray-400">
            {t('Join this team to access the team board and charter.', '팀 게시판과 팀 계획을 이용하려면 이 팀에 참여하세요.')}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
