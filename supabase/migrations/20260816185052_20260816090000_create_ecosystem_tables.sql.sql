/*
# IELTS PRO — Full Learning Ecosystem Database Extension

## Overview
Adds tables for mock exams, vocabulary library, grammar lab, study plans, streaks,
achievements, bookmarks, notes, speaking recordings, writing evaluations, performance
metrics, cheating events, and daily goals. All tables have RLS with owner-scoped CRUD.

## New Tables
1. mock_exams — Full IELTS mock exam definitions (academic/general)
2. mock_sections — Sections within a mock exam (listening, reading, writing, speaking)
3. mock_attempts — User attempt at a mock exam with timing and status
4. mock_answers — Individual answers within a mock attempt
5. mock_results — Final results for a mock attempt with per-skill bands
6. vocabulary_words — Shared vocabulary library with CEFR levels and categories
7. vocabulary_reviews — Spaced repetition schedule per user per word
8. grammar_topics — Grammar lesson topics with explanations
9. grammar_questions — Practice questions for grammar topics
10. grammar_progress — User progress per grammar topic
11. study_plans — Personalized study plans per user
12. study_plan_tasks — Tasks within a study plan
13. daily_goals — Daily goals per user with completion tracking
14. streaks — User streak tracking
15. bookmarks — Saved tests, words, grammar topics
16. notes — Personal notes on tests or vocabulary
17. speaking_recordings — Audio recording metadata for speaking practice
18. writing_evaluations — Writing submission evaluations
19. performance_metrics — Aggregated performance data per skill
20. cheating_events — Anti-cheating event log for mock exams

## Security
- RLS enabled on all new tables.
- Owner-scoped CRUD: users can only access their own data.
- Shared content tables (vocabulary_words, grammar_topics, grammar_questions, mock_exams,
  mock_sections) are readable by all authenticated users; writable by admin/teacher only.
*/

-- ============ MOCK EXAMS ============

CREATE TABLE IF NOT EXISTS mock_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  exam_type text NOT NULL DEFAULT 'academic' CHECK (exam_type IN ('academic', 'general')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  total_minutes integer NOT NULL DEFAULT 165,
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_mock_exams" ON mock_exams;
CREATE POLICY "read_mock_exams" ON mock_exams FOR SELECT
  TO authenticated USING (status = 'published');

DROP POLICY IF EXISTS "insert_mock_exams_admin" ON mock_exams;
CREATE POLICY "insert_mock_exams_admin" ON mock_exams FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "update_mock_exams_admin" ON mock_exams;
CREATE POLICY "update_mock_exams_admin" ON mock_exams FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "delete_mock_exams_admin" ON mock_exams;
CREATE POLICY "delete_mock_exams_admin" ON mock_exams FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- ============ MOCK SECTIONS ============

CREATE TABLE IF NOT EXISTS mock_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_exam_id uuid NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  skill text NOT NULL CHECK (skill IN ('listening', 'reading', 'writing', 'speaking')),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  audio_url text,
  section_order integer NOT NULL DEFAULT 0,
  time_limit_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mock_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_mock_sections" ON mock_sections;
CREATE POLICY "read_mock_sections" ON mock_sections FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM mock_exams WHERE mock_exams.id = mock_sections.mock_exam_id AND mock_exams.status = 'published')
  );

DROP POLICY IF EXISTS "insert_mock_sections_admin" ON mock_sections;
CREATE POLICY "insert_mock_sections_admin" ON mock_sections FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "update_mock_sections_admin" ON mock_sections;
CREATE POLICY "update_mock_sections_admin" ON mock_sections FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "delete_mock_sections_admin" ON mock_sections;
CREATE POLICY "delete_mock_sections_admin" ON mock_sections FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- ============ MOCK ATTEMPTS ============

CREATE TABLE IF NOT EXISTS mock_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_exam_id uuid NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  time_spent_seconds integer DEFAULT 0,
  current_section text,
  current_question_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mock_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mock_attempts" ON mock_attempts;
CREATE POLICY "select_own_mock_attempts" ON mock_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_mock_attempts" ON mock_attempts;
CREATE POLICY "insert_own_mock_attempts" ON mock_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_mock_attempts" ON mock_attempts;
CREATE POLICY "update_own_mock_attempts" ON mock_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ MOCK ANSWERS ============

CREATE TABLE IF NOT EXISTS mock_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_attempt_id uuid NOT NULL REFERENCES mock_attempts(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE SET NULL,
  mock_section_id uuid REFERENCES mock_sections(id) ON DELETE CASCADE,
  user_answer jsonb,
  is_correct boolean,
  time_spent_seconds integer DEFAULT 0,
  flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mock_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mock_answers" ON mock_answers;
CREATE POLICY "select_own_mock_answers" ON mock_answers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM mock_attempts WHERE mock_attempts.id = mock_answers.mock_attempt_id AND mock_attempts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_mock_answers" ON mock_answers;
CREATE POLICY "insert_own_mock_answers" ON mock_answers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM mock_attempts WHERE mock_attempts.id = mock_answers.mock_attempt_id AND mock_attempts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_mock_answers" ON mock_answers;
CREATE POLICY "update_own_mock_answers" ON mock_answers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM mock_attempts WHERE mock_attempts.id = mock_answers.mock_attempt_id AND mock_attempts.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM mock_attempts WHERE mock_attempts.id = mock_answers.mock_attempt_id AND mock_attempts.user_id = auth.uid())
  );

-- ============ MOCK RESULTS ============

CREATE TABLE IF NOT EXISTS mock_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_attempt_id uuid NOT NULL REFERENCES mock_attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_exam_id uuid NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  overall_band numeric(2,1),
  listening_band numeric(2,1),
  reading_band numeric(2,1),
  writing_band numeric(2,1),
  speaking_band numeric(2,1),
  listening_raw integer DEFAULT 0,
  reading_raw integer DEFAULT 0,
  listening_total integer DEFAULT 0,
  reading_total integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mock_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mock_results" ON mock_results;
CREATE POLICY "select_own_mock_results" ON mock_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_mock_results" ON mock_results;
CREATE POLICY "insert_own_mock_results" ON mock_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_mock_results" ON mock_results;
CREATE POLICY "update_own_mock_results" ON mock_results FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ VOCABULARY WORDS (shared content) ============

CREATE TABLE IF NOT EXISTS vocabulary_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  pronunciation text,
  part_of_speech text,
  definition text NOT NULL,
  uzbek_translation text,
  example_sentence text,
  synonyms text[] DEFAULT '{}',
  antonyms text[] DEFAULT '{}',
  word_family jsonb DEFAULT '[]',
  ielts_usage text,
  category text NOT NULL DEFAULT 'academic',
  cefr_level text CHECK (cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  ielts_band text CHECK (ielts_band IN ('5','6','7','8','9')),
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_vocabulary_words" ON vocabulary_words;
CREATE POLICY "read_vocabulary_words" ON vocabulary_words FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_vocabulary_words_admin" ON vocabulary_words;
CREATE POLICY "insert_vocabulary_words_admin" ON vocabulary_words FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "update_vocabulary_words_admin" ON vocabulary_words;
CREATE POLICY "update_vocabulary_words_admin" ON vocabulary_words FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "delete_vocabulary_words_admin" ON vocabulary_words;
CREATE POLICY "delete_vocabulary_words_admin" ON vocabulary_words FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- ============ VOCABULARY REVIEWS (spaced repetition) ============

CREATE TABLE IF NOT EXISTS vocabulary_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  vocabulary_word_id uuid NOT NULL REFERENCES vocabulary_words(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','learning','reviewing','mastered','difficult')),
  mastery_level integer NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  next_review_date date DEFAULT CURRENT_DATE,
  review_interval_days integer DEFAULT 1,
  review_count integer DEFAULT 0,
  correct_count integer DEFAULT 0,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, vocabulary_word_id)
);

ALTER TABLE vocabulary_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_vocab_reviews" ON vocabulary_reviews;
CREATE POLICY "select_own_vocab_reviews" ON vocabulary_reviews FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_vocab_reviews" ON vocabulary_reviews;
CREATE POLICY "insert_own_vocab_reviews" ON vocabulary_reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_vocab_reviews" ON vocabulary_reviews;
CREATE POLICY "update_own_vocab_reviews" ON vocabulary_reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_vocab_reviews" ON vocabulary_reviews;
CREATE POLICY "delete_own_vocab_reviews" ON vocabulary_reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ GRAMMAR TOPICS (shared content) ============

CREATE TABLE IF NOT EXISTS grammar_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  explanation text NOT NULL,
  examples text[] DEFAULT '{}',
  common_mistakes text[] DEFAULT '{}',
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grammar_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_grammar_topics" ON grammar_topics;
CREATE POLICY "read_grammar_topics" ON grammar_topics FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_grammar_topics_admin" ON grammar_topics;
CREATE POLICY "insert_grammar_topics_admin" ON grammar_topics FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "update_grammar_topics_admin" ON grammar_topics;
CREATE POLICY "update_grammar_topics_admin" ON grammar_topics FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "delete_grammar_topics_admin" ON grammar_topics;
CREATE POLICY "delete_grammar_topics_admin" ON grammar_topics FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- ============ GRAMMAR QUESTIONS (shared content) ============

CREATE TABLE IF NOT EXISTS grammar_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grammar_topic_id uuid NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
  question_number integer NOT NULL DEFAULT 1,
  prompt text NOT NULL,
  options jsonb,
  correct_answer jsonb NOT NULL,
  explanation text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grammar_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_grammar_questions" ON grammar_questions;
CREATE POLICY "read_grammar_questions" ON grammar_questions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_grammar_questions_admin" ON grammar_questions;
CREATE POLICY "insert_grammar_questions_admin" ON grammar_questions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "update_grammar_questions_admin" ON grammar_questions;
CREATE POLICY "update_grammar_questions_admin" ON grammar_questions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "delete_grammar_questions_admin" ON grammar_questions;
CREATE POLICY "delete_grammar_questions_admin" ON grammar_questions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- ============ GRAMMAR PROGRESS ============

CREATE TABLE IF NOT EXISTS grammar_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  grammar_topic_id uuid NOT NULL REFERENCES grammar_topics(id) ON DELETE CASCADE,
  questions_attempted integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0,
  last_practiced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, grammar_topic_id)
);

ALTER TABLE grammar_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_grammar_progress" ON grammar_progress;
CREATE POLICY "select_own_grammar_progress" ON grammar_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_grammar_progress" ON grammar_progress;
CREATE POLICY "insert_own_grammar_progress" ON grammar_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_grammar_progress" ON grammar_progress;
CREATE POLICY "update_own_grammar_progress" ON grammar_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_grammar_progress" ON grammar_progress;
CREATE POLICY "delete_own_grammar_progress" ON grammar_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ STUDY PLANS ============

CREATE TABLE IF NOT EXISTS study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '30-Day IELTS Plan',
  target_band numeric(2,1) DEFAULT 7.5,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_study_plans" ON study_plans;
CREATE POLICY "select_own_study_plans" ON study_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_study_plans" ON study_plans;
CREATE POLICY "insert_own_study_plans" ON study_plans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_study_plans" ON study_plans;
CREATE POLICY "update_own_study_plans" ON study_plans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_study_plans" ON study_plans;
CREATE POLICY "delete_own_study_plans" ON study_plans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ STUDY PLAN TASKS ============

CREATE TABLE IF NOT EXISTS study_plan_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_plan_id uuid NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  week_number integer NOT NULL DEFAULT 1,
  day_number integer NOT NULL DEFAULT 1,
  skill text CHECK (skill IN ('reading','listening','writing','speaking','vocabulary','grammar')),
  description text NOT NULL,
  target_count integer DEFAULT 1,
  completed_count integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_plan_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_study_plan_tasks" ON study_plan_tasks;
CREATE POLICY "select_own_study_plan_tasks" ON study_plan_tasks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM study_plans WHERE study_plans.id = study_plan_tasks.study_plan_id AND study_plans.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_study_plan_tasks" ON study_plan_tasks;
CREATE POLICY "insert_own_study_plan_tasks" ON study_plan_tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM study_plans WHERE study_plans.id = study_plan_tasks.study_plan_id AND study_plans.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_study_plan_tasks" ON study_plan_tasks;
CREATE POLICY "update_own_study_plan_tasks" ON study_plan_tasks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM study_plans WHERE study_plans.id = study_plan_tasks.study_plan_id AND study_plans.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM study_plans WHERE study_plans.id = study_plan_tasks.study_plan_id AND study_plans.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_study_plan_tasks" ON study_plan_tasks;
CREATE POLICY "delete_own_study_plan_tasks" ON study_plan_tasks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM study_plans WHERE study_plans.id = study_plan_tasks.study_plan_id AND study_plans.user_id = auth.uid())
  );

-- ============ DAILY GOALS ============

CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_date date NOT NULL DEFAULT CURRENT_DATE,
  skill text CHECK (skill IN ('reading','listening','writing','speaking','vocabulary','grammar')),
  description text NOT NULL,
  target_count integer DEFAULT 1,
  completed_count integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, goal_date, skill)
);

ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_daily_goals" ON daily_goals;
CREATE POLICY "select_own_daily_goals" ON daily_goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_daily_goals" ON daily_goals;
CREATE POLICY "insert_own_daily_goals" ON daily_goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_daily_goals" ON daily_goals;
CREATE POLICY "update_own_daily_goals" ON daily_goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_daily_goals" ON daily_goals;
CREATE POLICY "delete_own_daily_goals" ON daily_goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ STREAKS ============

CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_activity_date date,
  total_active_days integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_streaks" ON streaks;
CREATE POLICY "select_own_streaks" ON streaks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_streaks" ON streaks;
CREATE POLICY "insert_own_streaks" ON streaks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_streaks" ON streaks;
CREATE POLICY "update_own_streaks" ON streaks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_streaks" ON streaks;
CREATE POLICY "delete_own_streaks" ON streaks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ BOOKMARKS ============

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('test','vocabulary','grammar','speaking','mock_exam')),
  item_id text NOT NULL,
  title text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_bookmarks" ON bookmarks;
CREATE POLICY "select_own_bookmarks" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_bookmarks" ON bookmarks;
CREATE POLICY "insert_own_bookmarks" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_bookmarks" ON bookmarks;
CREATE POLICY "delete_own_bookmarks" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ NOTES ============

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('test','vocabulary','grammar','question')),
  item_id text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notes" ON notes;
CREATE POLICY "select_own_notes" ON notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notes" ON notes;
CREATE POLICY "insert_own_notes" ON notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notes" ON notes;
CREATE POLICY "update_own_notes" ON notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notes" ON notes;
CREATE POLICY "delete_own_notes" ON notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ SPEAKING RECORDINGS ============

CREATE TABLE IF NOT EXISTS speaking_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  part text NOT NULL CHECK (part IN ('part1','part2','part3')),
  topic text NOT NULL,
  recording_url text,
  duration_seconds integer DEFAULT 0,
  overall_band numeric(2,1),
  fluency numeric(2,1),
  lexical_resource numeric(2,1),
  grammatical_range numeric(2,1),
  pronunciation numeric(2,1),
  ai_report jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','evaluated','failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE speaking_recordings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_speaking_recordings" ON speaking_recordings;
CREATE POLICY "select_own_speaking_recordings" ON speaking_recordings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_speaking_recordings" ON speaking_recordings;
CREATE POLICY "insert_own_speaking_recordings" ON speaking_recordings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_speaking_recordings" ON speaking_recordings;
CREATE POLICY "update_own_speaking_recordings" ON speaking_recordings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_speaking_recordings" ON speaking_recordings;
CREATE POLICY "delete_own_speaking_recordings" ON speaking_recordings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ WRITING EVALUATIONS ============

CREATE TABLE IF NOT EXISTS writing_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  word_count integer DEFAULT 0,
  overall_band numeric(2,1),
  task_achievement numeric(2,1),
  coherence numeric(2,1),
  lexical_resource numeric(2,1),
  grammatical_range numeric(2,1),
  ai_report jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','evaluated','failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE writing_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_writing_evaluations" ON writing_evaluations;
CREATE POLICY "select_own_writing_evaluations" ON writing_evaluations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_writing_evaluations" ON writing_evaluations;
CREATE POLICY "insert_own_writing_evaluations" ON writing_evaluations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_writing_evaluations" ON writing_evaluations;
CREATE POLICY "update_own_writing_evaluations" ON writing_evaluations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_writing_evaluations" ON writing_evaluations;
CREATE POLICY "delete_own_writing_evaluations" ON writing_evaluations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ PERFORMANCE METRICS ============

CREATE TABLE IF NOT EXISTS performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  skill text NOT NULL CHECK (skill IN ('reading','listening','writing','speaking')),
  questions_answered integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0,
  average_time_seconds integer DEFAULT 0,
  best_band numeric(2,1),
  question_type_performance jsonb DEFAULT '{}',
  topic_performance jsonb DEFAULT '{}',
  difficulty_performance jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, skill)
);

ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_performance_metrics" ON performance_metrics;
CREATE POLICY "select_own_performance_metrics" ON performance_metrics FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_performance_metrics" ON performance_metrics;
CREATE POLICY "insert_own_performance_metrics" ON performance_metrics FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_performance_metrics" ON performance_metrics;
CREATE POLICY "update_own_performance_metrics" ON performance_metrics FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_performance_metrics" ON performance_metrics;
CREATE POLICY "delete_own_performance_metrics" ON performance_metrics FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ CHEATING EVENTS ============

CREATE TABLE IF NOT EXISTS cheating_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mock_attempt_id uuid REFERENCES mock_attempts(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('tab_switch','fullscreen_exit','focus_loss','copy_attempt','paste_attempt','screenshot')),
  description text,
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE cheating_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cheating_events" ON cheating_events;
CREATE POLICY "select_own_cheating_events" ON cheating_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cheating_events" ON cheating_events;
CREATE POLICY "insert_own_cheating_events" ON cheating_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_admin_cheating_events" ON cheating_events;
CREATE POLICY "select_admin_cheating_events" ON cheating_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============ INDEXES ============

CREATE INDEX IF NOT EXISTS idx_mock_sections_exam ON mock_sections(mock_exam_id);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_user ON mock_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_exam ON mock_attempts(mock_exam_id);
CREATE INDEX IF NOT EXISTS idx_mock_answers_attempt ON mock_answers(mock_attempt_id);
CREATE INDEX IF NOT EXISTS idx_mock_results_user ON mock_results(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_reviews_user ON vocabulary_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_reviews_next_review ON vocabulary_reviews(next_review_date);
CREATE INDEX IF NOT EXISTS idx_vocab_reviews_status ON vocabulary_reviews(status);
CREATE INDEX IF NOT EXISTS idx_grammar_questions_topic ON grammar_questions(grammar_topic_id);
CREATE INDEX IF NOT EXISTS idx_grammar_progress_user ON grammar_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_plan ON study_plan_tasks(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, goal_date);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_speaking_recordings_user ON speaking_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_evaluations_user ON writing_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_cheating_events_user ON cheating_events(user_id);
