-- ============================================================
-- ML4HS Admin & Home Schema
-- ============================================================

-- 1. 교수 권한 컬럼 추가
alter table profiles add column if not exists is_admin boolean default false;

-- 2. is_admin 헬퍼 함수 (RLS 순환참조 방지)
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = ''
as $$ select coalesce((select is_admin from public.profiles where id = auth.uid()), false) $$;

-- 3. 교수는 모든 프로필/로그 조회 가능
create policy "Admin views all profiles" on profiles
  for select using (public.is_admin());

create policy "Admin views all logs" on daily_logs
  for select using (public.is_admin());

-- 4. 교수가 학생을 팀에 배정/해제 가능
create policy "Admin assigns members" on team_members
  for insert with check (public.is_admin());

create policy "Admin removes members" on team_members
  for delete using (public.is_admin());

-- 5. 공지사항 테이블
create table if not exists announcements (
  id         uuid default gen_random_uuid() primary key,
  title      text not null,
  content    text,
  created_at timestamptz default now()
);

alter table announcements enable row level security;

create policy "All view announcements"   on announcements for select using (auth.uid() is not null);
create policy "Admin creates announcement" on announcements for insert with check (public.is_admin());
create policy "Admin deletes announcement" on announcements for delete using (public.is_admin());
