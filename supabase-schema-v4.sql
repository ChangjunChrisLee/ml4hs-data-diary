-- ============================================================
-- ML4HS v4 Schema Migration — Device per media type
-- Run this in Supabase SQL Editor
-- ============================================================

alter table daily_logs add column if not exists device_tv_ott    text;
alter table daily_logs add column if not exists device_longform   text;
alter table daily_logs add column if not exists device_shortform  text;
alter table daily_logs add column if not exists device_sns        text;
alter table daily_logs add column if not exists device_messenger  text;
alter table daily_logs add column if not exists device_game       text;
alter table daily_logs add column if not exists device_music      text;
alter table daily_logs add column if not exists device_news       text;
alter table daily_logs add column if not exists device_webtoon    text;
alter table daily_logs add column if not exists device_reading    text;
