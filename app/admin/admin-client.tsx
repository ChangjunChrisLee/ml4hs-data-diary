'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Student = {
  id: string
  anonymous_id: string
  created_at: string
  logCount: number
  teamName: string | null
}

export type Team = {
  id: string
  name: string
  research_question: string | null
  team_members: { student_id: string }[]
}

type Announcement = {
  id: string
  title: string
  content: string | null
  created_at: string
}

export default function AdminClient({
  students,
  teams,
  announcements: initialAnnouncements,
}: {
  students: Student[]
  teams: Team[]
  announcements: Announcement[]
}) {
  const [tab, setTab] = useState<'students' | 'teams' | 'announcements'>('students')
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [assignMap, setAssignMap] = useState<Record<string, string>>({})
  const [assigning, setAssigning] = useState<string | null>(null)

  const unassigned = students.filter(s => !s.teamName)
  const totalLogs = students.reduce((sum, s) => sum + s.logCount, 0)

  async function postAnnouncement() {
    if (!newTitle.trim()) return
    setPosting(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('announcements')
      .insert({ title: newTitle.trim(), content: newContent.trim() || null })
      .select()
      .single()
    if (!error && data) {
      setAnnouncements([data, ...announcements])
      setNewTitle('')
      setNewContent('')
    }
    setPosting(false)
  }

  async function deleteAnnouncement(id: string) {
    const supabase = createClient()
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(announcements.filter(a => a.id !== id))
  }

  async function assignToTeam(studentId: string) {
    const teamId = assignMap[studentId]
    if (!teamId) return
    setAssigning(studentId)
    const supabase = createClient()
    await supabase.from('team_members').insert({ team_id: teamId, student_id: studentId })
    setAssigning(null)
    window.location.reload()
  }

  function downloadCSV() {
    window.location.href = '/api/export'
  }

  const tabs = [
    { key: 'students', label: `Students (${students.length})` },
    { key: 'teams', label: `Teams (${teams.length})` },
    { key: 'announcements', label: `Announcements` },
  ] as const

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button variant="outline" size="sm" onClick={downloadCSV}>
          Export CSV
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold">{students.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold">{totalLogs}</p>
            <p className="text-xs text-gray-400 mt-0.5">Total logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl font-bold">{unassigned.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Unassigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {tab === 'students' && (
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-0">
              <div className="grid grid-cols-4 gap-2 px-2 pb-2 text-xs font-medium text-gray-400 uppercase">
                <span>ID</span>
                <span className="text-center">Logs</span>
                <span className="col-span-2">Team</span>
              </div>
              {students.map(s => (
                <div key={s.id} className="grid grid-cols-4 gap-2 px-2 py-2 text-sm border-t items-center">
                  <span className="font-mono text-xs">{s.anonymous_id}</span>
                  <span className={`text-center font-medium ${s.logCount === 0 ? 'text-red-400' : s.logCount < 5 ? 'text-orange-500' : 'text-green-600'}`}>
                    {s.logCount}
                  </span>
                  <span className="col-span-2 text-gray-500 text-xs">
                    {s.teamName ?? <span className="text-red-400">unassigned</span>}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Teams tab */}
      {tab === 'teams' && (
        <div className="space-y-4">
          {unassigned.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-orange-700">Unassigned Students</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unassigned.map(s => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="font-mono text-xs w-24">{s.anonymous_id}</span>
                    <select
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      value={assignMap[s.id] ?? ''}
                      onChange={e => setAssignMap(prev => ({ ...prev, [s.id]: e.target.value }))}
                    >
                      <option value="">Select team…</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      disabled={!assignMap[s.id] || assigning === s.id}
                      onClick={() => assignToTeam(s.id)}
                    >
                      Assign
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {teams.map(t => (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{t.name}</CardTitle>
                  <Badge className="text-xs bg-gray-100 text-gray-600">
                    {t.team_members.length} members
                  </Badge>
                </div>
                {t.research_question && (
                  <p className="text-xs text-gray-400 mt-1">{t.research_question}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {t.team_members.map(m => {
                    const s = students.find(st => st.id === m.student_id)
                    return (
                      <span key={m.student_id} className="text-xs font-mono bg-gray-50 border px-2 py-1 rounded">
                        {s?.anonymous_id ?? m.student_id.slice(0, 8)}
                      </span>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          {teams.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No teams yet.</p>
          )}
        </div>
      )}

      {/* Announcements tab */}
      {tab === 'announcements' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">New Announcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <input
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
              <textarea
                className="w-full border rounded px-3 py-2 text-sm resize-none"
                placeholder="Content (optional)"
                rows={3}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              />
              <Button size="sm" disabled={posting || !newTitle.trim()} onClick={postAnnouncement}>
                {posting ? 'Posting…' : 'Post'}
              </Button>
            </CardContent>
          </Card>

          {announcements.map(a => (
            <Card key={a.id}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.content && <p className="text-sm text-gray-500 mt-0.5">{a.content}</p>}
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(a.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAnnouncement(a.id)}
                    className="text-xs text-red-400 hover:text-red-600 shrink-0"
                  >
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {announcements.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No announcements yet.</p>
          )}
        </div>
      )}
    </main>
  )
}
