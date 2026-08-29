-- ============================================================
-- ML4HS v3 Schema Migration — Personal Probe x5
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. profiles: replace single probe_label with 5 slots
alter table profiles drop column if exists probe_label;
alter table profiles add column if not exists probe_label_1 text;
alter table profiles add column if not exists probe_label_2 text;
alter table profiles add column if not exists probe_label_3 text;
alter table profiles add column if not exists probe_label_4 text;
alter table profiles add column if not exists probe_label_5 text;

-- 2. daily_logs: replace single probe_value with 5 slots
alter table daily_logs drop column if exists probe_value;
alter table daily_logs add column if not exists probe_value_1 numeric(5,1);
alter table daily_logs add column if not exists probe_value_2 numeric(5,1);
alter table daily_logs add column if not exists probe_value_3 numeric(5,1);
alter table daily_logs add column if not exists probe_value_4 numeric(5,1);
alter table daily_logs add column if not exists probe_value_5 numeric(5,1);
