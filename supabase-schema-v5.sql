-- ============================================================
-- ML4HS v5 Schema Migration — One-time Profile Survey
-- Run this in Supabase SQL Editor
-- ============================================================

-- Demographics
alter table profiles add column if not exists gender        text;
alter table profiles add column if not exists birth_year    smallint;
alter table profiles add column if not exists school_year   text;
alter table profiles add column if not exists major_field   text;
alter table profiles add column if not exists residence     text;

-- Device ownership (multi-select)
alter table profiles add column if not exists owns_smartphone  boolean;
alter table profiles add column if not exists owns_tablet       boolean;
alter table profiles add column if not exists owns_pc_laptop    boolean;
alter table profiles add column if not exists owns_smart_tv     boolean;
alter table profiles add column if not exists owns_ebook_reader boolean;
alter table profiles add column if not exists owns_console      boolean;

-- Ranked services (1st / 2nd / 3rd)
alter table profiles add column if not exists ott_rank_1   text;
alter table profiles add column if not exists ott_rank_2   text;
alter table profiles add column if not exists ott_rank_3   text;
alter table profiles add column if not exists music_rank_1 text;
alter table profiles add column if not exists music_rank_2 text;
alter table profiles add column if not exists music_rank_3 text;
alter table profiles add column if not exists sns_rank_1   text;
alter table profiles add column if not exists sns_rank_2   text;
alter table profiles add column if not exists sns_rank_3   text;

-- Media attitudes (1–5 scale, KISDI-harmonized)
alter table profiles add column if not exists attitude_importance smallint;
alter table profiles add column if not exists attitude_algorithm  smallint;
alter table profiles add column if not exists attitude_control    smallint;
alter table profiles add column if not exists attitude_regret     smallint;

-- Completion timestamp (null = not yet done)
alter table profiles add column if not exists survey_completed_at timestamptz;
