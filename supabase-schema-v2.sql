-- ============================================================
-- ML4HS v2 Schema Migration — Media Variable Redesign
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. daily_logs: remove old media columns
alter table daily_logs drop column if exists media_hours;
alter table daily_logs drop column if exists main_media_type;
alter table daily_logs drop column if exists main_device;
alter table daily_logs drop column if exists simultaneous_use;
alter table daily_logs drop column if exists bedtime_use;

-- 2. daily_logs: media breakdown by type (hours, 0.5 step)
alter table daily_logs add column if not exists media_tv_ott    numeric(4,1);
alter table daily_logs add column if not exists media_longform  numeric(4,1);
alter table daily_logs add column if not exists media_shortform numeric(4,1);
alter table daily_logs add column if not exists media_sns       numeric(4,1);
alter table daily_logs add column if not exists media_game      numeric(4,1);
alter table daily_logs add column if not exists media_music     numeric(4,1);
alter table daily_logs add column if not exists media_reading   numeric(4,1);

-- 3. daily_logs: content genre (applies to TV/OTT + YouTube long-form)
alter table daily_logs add column if not exists main_content_genre text;

-- 4. daily_logs: behavioral flags
alter table daily_logs add column if not exists media_multitasking boolean;
alter table daily_logs add column if not exists bedtime_media      boolean;

-- 5. daily_logs: Personal Probe value (scale set by student, Week 4+)
alter table daily_logs add column if not exists probe_value numeric(5,1);

-- 6. profiles: Personal Probe label (student writes this once in Week 4)
alter table profiles add column if not exists probe_label text;
