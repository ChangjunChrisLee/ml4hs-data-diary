-- ============================================================
-- ML4HS v2b Schema Migration — Media Type Expansion
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Remove deprecated columns
alter table daily_logs drop column if exists main_content_genre;
alter table daily_logs drop column if exists media_multitasking;
alter table daily_logs drop column if exists bedtime_media;

-- 2. New media type columns (split SNS/Messenger, Reading into News/Webtoon/Reading)
alter table daily_logs add column if not exists media_messenger numeric(4,1);
alter table daily_logs add column if not exists media_news      numeric(4,1);
alter table daily_logs add column if not exists media_webtoon   numeric(4,1);
-- media_reading now means books/e-books only (was News+Webtoon+Reading)
-- media_sns now means SNS only (was SNS+Messenger)

-- 3. Per-type genre columns (TV, Long-form, Short-form, Games, Music)
alter table daily_logs add column if not exists genre_tv_ott    text;
alter table daily_logs add column if not exists genre_longform  text;
alter table daily_logs add column if not exists genre_shortform text;
alter table daily_logs add column if not exists genre_game      text;
alter table daily_logs add column if not exists genre_music     text;

-- 4. Per-type bedtime columns (all 10 media types)
alter table daily_logs add column if not exists bedtime_tv_ott    boolean;
alter table daily_logs add column if not exists bedtime_longform  boolean;
alter table daily_logs add column if not exists bedtime_shortform boolean;
alter table daily_logs add column if not exists bedtime_sns       boolean;
alter table daily_logs add column if not exists bedtime_messenger boolean;
alter table daily_logs add column if not exists bedtime_game      boolean;
alter table daily_logs add column if not exists bedtime_music     boolean;
alter table daily_logs add column if not exists bedtime_news      boolean;
alter table daily_logs add column if not exists bedtime_webtoon   boolean;
alter table daily_logs add column if not exists bedtime_reading   boolean;
