-- Profile extensions for study plan, i18n, agent modes
ALTER TABLE learning_profiles ADD COLUMN IF NOT EXISTS exam_date timestamp;
ALTER TABLE learning_profiles ADD COLUMN IF NOT EXISTS daily_study_minutes integer NOT NULL DEFAULT 30;
ALTER TABLE learning_profiles ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en';
ALTER TABLE learning_profiles ADD COLUMN IF NOT EXISTS agent_mode text NOT NULL DEFAULT 'socratic';
ALTER TABLE learning_profiles ADD COLUMN IF NOT EXISTS strict_source_mode integer NOT NULL DEFAULT 1;
ALTER TABLE learning_profiles ADD COLUMN IF NOT EXISTS socratic_mode integer NOT NULL DEFAULT 1;
