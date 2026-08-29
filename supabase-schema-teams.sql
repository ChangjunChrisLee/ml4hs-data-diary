-- ============================================================
-- ML4HS Teams Schema
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. 팀 테이블
create table if not exists teams (
  id                uuid default gen_random_uuid() primary key,
  name              text not null,
  research_question text,
  charter           text,
  created_by        uuid references profiles(id) on delete set null,
  created_at        timestamptz default now()
);

-- 2. 팀 멤버 테이블 (최대 5명)
create table if not exists team_members (
  team_id    uuid references teams(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  joined_at  timestamptz default now(),
  primary key (team_id, student_id)
);

-- 3. 팀 게시판 테이블
create table if not exists team_posts (
  id         uuid default gen_random_uuid() primary key,
  team_id    uuid references teams(id) on delete cascade,
  author_id  uuid references profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);

-- 4. RLS 활성화
alter table teams        enable row level security;
alter table team_members enable row level security;
alter table team_posts   enable row level security;

-- 5. Teams 정책: 로그인한 누구나 조회, 생성 가능 / 팀원만 수정
create policy "View teams"   on teams for select using (auth.uid() is not null);
create policy "Create team"  on teams for insert with check (auth.uid() is not null);
create policy "Update team"  on teams for update using (
  exists (select 1 from team_members where team_id = teams.id and student_id = auth.uid())
);

-- 6. Team members 정책
create policy "View members" on team_members for select using (auth.uid() is not null);
create policy "Join team"    on team_members for insert with check (student_id = auth.uid());
create policy "Leave team"   on team_members for delete  using (student_id = auth.uid());

-- 7. Team posts 정책: 팀원만 조회 및 작성
create policy "View posts"   on team_posts for select using (
  exists (select 1 from team_members where team_id = team_posts.team_id and student_id = auth.uid())
);
create policy "Create post"  on team_posts for insert with check (
  author_id = auth.uid() and
  exists (select 1 from team_members where team_id = team_posts.team_id and student_id = auth.uid())
);
create policy "Delete post"  on team_posts for delete using (author_id = auth.uid());
