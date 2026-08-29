-- ============================================================
-- ML4HS v6 Schema Migration — KMP Scales + AI Service + AI Media
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── profiles: KMP 2025 삶의 만족도 ──────────────────────────────────────────
-- 측면별 만족도 (1–10)
alter table profiles add column if not exists life_sat_personal   smallint;
alter table profiles add column if not exists life_sat_relational smallint;
alter table profiles add column if not exists life_sat_collective smallint;

-- SWLS 삶의 만족도 척도 (1–7, Diener et al. 1985)
alter table profiles add column if not exists swls_1 smallint;
alter table profiles add column if not exists swls_2 smallint;
alter table profiles add column if not exists swls_3 smallint;
alter table profiles add column if not exists swls_4 smallint;
alter table profiles add column if not exists swls_5 smallint;

-- 지난 한달 감정 경험 빈도 (1–5)
alter table profiles add column if not exists emotion_joyful   smallint;
alter table profiles add column if not exists emotion_happy    smallint;
alter table profiles add column if not exists emotion_calm     smallint;
alter table profiles add column if not exists emotion_annoyed  smallint;
alter table profiles add column if not exists emotion_negative smallint;
alter table profiles add column if not exists emotion_helpless smallint;

-- ── profiles: KMP 2025 자아존중감 (Rosenberg, 1–4) ──────────────────────────
alter table profiles add column if not exists rse_1  smallint;
alter table profiles add column if not exists rse_2  smallint;
alter table profiles add column if not exists rse_3  smallint;
alter table profiles add column if not exists rse_4  smallint;
alter table profiles add column if not exists rse_5  smallint;
alter table profiles add column if not exists rse_6  smallint;
alter table profiles add column if not exists rse_7  smallint;
alter table profiles add column if not exists rse_8  smallint;
alter table profiles add column if not exists rse_9  smallint;
alter table profiles add column if not exists rse_10 smallint;

-- ── profiles: KMP 2024 소비자혁신성 (1–5) ───────────────────────────────────
alter table profiles add column if not exists innov_func_1     smallint;
alter table profiles add column if not exists innov_func_2     smallint;
alter table profiles add column if not exists innov_func_3     smallint;
alter table profiles add column if not exists innov_func_4     smallint;
alter table profiles add column if not exists innov_hedonic_1  smallint;
alter table profiles add column if not exists innov_hedonic_2  smallint;
alter table profiles add column if not exists innov_hedonic_3  smallint;
alter table profiles add column if not exists innov_hedonic_4  smallint;
alter table profiles add column if not exists innov_social_1   smallint;
alter table profiles add column if not exists innov_social_2   smallint;
alter table profiles add column if not exists innov_social_3   smallint;
alter table profiles add column if not exists innov_social_4   smallint;
alter table profiles add column if not exists innov_cognitive_1 smallint;
alter table profiles add column if not exists innov_cognitive_2 smallint;
alter table profiles add column if not exists innov_cognitive_3 smallint;
alter table profiles add column if not exists innov_cognitive_4 smallint;

-- ── profiles: AI 서비스 ──────────────────────────────────────────────────────
alter table profiles add column if not exists ai_rank_1        text;
alter table profiles add column if not exists ai_rank_2        text;
alter table profiles add column if not exists ai_rank_3        text;
alter table profiles add column if not exists ai_paid_chatgpt  boolean;
alter table profiles add column if not exists ai_paid_claude   boolean;
alter table profiles add column if not exists ai_paid_gemini   boolean;
alter table profiles add column if not exists ai_paid_copilot  boolean;
alter table profiles add column if not exists ai_paid_perplexity boolean;
alter table profiles add column if not exists ai_paid_other    boolean;

-- ── daily_logs: AI 미디어 타입 ───────────────────────────────────────────────
alter table daily_logs add column if not exists media_ai    numeric(4,1);
alter table daily_logs add column if not exists device_ai   text;
alter table daily_logs add column if not exists bedtime_ai  boolean;

-- ── Deployment hardening: profile updates and team integrity ────────────────
-- Students need this policy to save the profile survey and personal probes.
drop policy if exists "본인 프로필 수정" on profiles;
create policy "본인 프로필 수정" on profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- A student may belong to only one team.
create unique index if not exists team_members_one_team_per_student
  on team_members (student_id);

-- Serialize joins per team so concurrent requests cannot exceed five members.
create or replace function public.enforce_team_capacity()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.team_id::text, 0));

  if (select count(*) from public.team_members where team_id = new.team_id) >= 5 then
    raise exception 'This team already has five members.' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_team_capacity_before_insert on team_members;
create trigger enforce_team_capacity_before_insert
  before insert on team_members
  for each row execute function public.enforce_team_capacity();

-- Students can only create teams attributed to themselves.
drop policy if exists "Create team" on teams;
create policy "Create team" on teams
  for insert with check (auth.uid() is not null and created_by = auth.uid());
