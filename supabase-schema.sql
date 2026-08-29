-- ============================================================
-- ML4HS Data Diary — Supabase SQL Schema (Step 1)
-- Supabase Dashboard → SQL Editor에서 실행하세요
-- ============================================================

-- 1. 학생 프로필 테이블
--    auth.users와 연결되며, 익명 ID가 자동 생성됩니다.
create table if not exists profiles (
  id           uuid references auth.users on delete cascade primary key,
  anonymous_id text unique not null,
  created_at   timestamptz default now()
);

-- 2. 일일 기록 테이블 (Daily Core Log)
create table if not exists daily_logs (
  id               uuid default gen_random_uuid() primary key,
  student_id       uuid references profiles(id) on delete cascade not null,
  log_date         date not null,
  -- 시간 기록
  sleep_hours      numeric(4,1),
  study_hours      numeric(4,1),
  media_hours      numeric(4,1),
  -- 미디어 & 기기
  main_media_type  text,   -- youtube_otv | sns | music_podcast | messaging | games | news | other
  main_device      text,   -- smartphone | laptop | tablet | tv | pc | other
  simultaneous_use boolean,
  bedtime_use      boolean,
  -- 상태 (1~5)
  mood             smallint check (mood between 1 and 5),
  stress           smallint check (stress between 1 and 5),
  fatigue          smallint check (fatigue between 1 and 5),
  focus            smallint check (focus between 1 and 5),
  -- 하루 유형
  day_type         text,   -- normal | deadline | exam | social | parttime | other
  created_at       timestamptz default now(),
  -- 같은 날짜 중복 방지
  unique (student_id, log_date)
);

-- 3. Row Level Security 활성화
alter table profiles  enable row level security;
alter table daily_logs enable row level security;

-- 4. RLS 정책: 본인 데이터만 접근
create policy "본인 프로필 조회" on profiles  for select using (auth.uid() = id);
create policy "본인 프로필 생성" on profiles  for insert with check (auth.uid() = id);

create policy "본인 로그 조회"   on daily_logs for select using (student_id = auth.uid());
create policy "본인 로그 생성"   on daily_logs for insert with check (student_id = auth.uid());
create policy "본인 로그 수정"   on daily_logs for update using (student_id = auth.uid());

-- 5. 회원가입 시 익명 ID 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  seq_num  int;
  anon_id  text;
begin
  select coalesce(max(split_part(anonymous_id, '-', 2)::int), 0) + 1
    into seq_num
    from public.profiles;

  anon_id := 'ML26-' || lpad(seq_num::text, 3, '0');

  insert into public.profiles (id, anonymous_id)
  values (new.id, anon_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
