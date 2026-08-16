/*
# IELTS PRO — Core Database Schema

## Overview
Creates the foundational tables for the IELTS preparation platform: profiles, tests, sections, questions, attempts, answers, results, writing/speaking submissions, vocabulary progress, mistakes, achievements, and notifications.

## Security
- RLS enabled on all tables.
- Owner-scoped CRUD: users can only access their own data.
- Tests/sections/questions are shared content readable by all authenticated users.
- Profiles: users can read and update only their own profile.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  target_band numeric(2,1) DEFAULT 7.5,
  exam_date date,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  skill text NOT NULL CHECK (skill IN ('reading', 'listening', 'writing', 'speaking', 'mock')),
  exam_type text NOT NULL DEFAULT 'academic' CHECK (exam_type IN ('academic', 'general')),
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_count integer NOT NULL DEFAULT 0,
  estimated_minutes integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_tests" ON tests;
CREATE POLICY "read_tests" ON tests FOR SELECT
  TO authenticated USING (status = 'published');

DROP POLICY IF EXISTS "insert_tests_admin" ON tests;
CREATE POLICY "insert_tests_admin" ON tests FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "update_tests_admin" ON tests;
CREATE POLICY "update_tests_admin" ON tests FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  section_order integer NOT NULL DEFAULT 0,
  audio_url text,
  word_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_sections" ON sections;
CREATE POLICY "read_sections" ON sections FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM tests WHERE tests.id = sections.test_id AND tests.status = 'published')
  );

DROP POLICY IF EXISTS "insert_sections_admin" ON sections;
CREATE POLICY "insert_sections_admin" ON sections FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "update_sections_admin" ON sections;
CREATE POLICY "update_sections_admin" ON sections FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  question_type text NOT NULL,
  question_number integer NOT NULL DEFAULT 1,
  prompt text NOT NULL,
  options jsonb,
  correct_answer jsonb NOT NULL,
  explanation text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category text NOT NULL DEFAULT '',
  time_estimate integer DEFAULT 60,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_questions" ON questions;
CREATE POLICY "read_questions" ON questions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_questions_admin" ON questions;
CREATE POLICY "insert_questions_admin" ON questions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

DROP POLICY IF EXISTS "update_questions_admin" ON questions;
CREATE POLICY "update_questions_admin" ON questions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'teacher'))
  );

-- Attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  time_spent_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_attempts" ON attempts;
CREATE POLICY "select_own_attempts" ON attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_attempts" ON attempts;
CREATE POLICY "insert_own_attempts" ON attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_attempts" ON attempts;
CREATE POLICY "update_own_attempts" ON attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer jsonb,
  is_correct boolean,
  flagged boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_answers" ON answers;
CREATE POLICY "select_own_answers" ON answers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM attempts WHERE attempts.id = answers.attempt_id AND attempts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_answers" ON answers;
CREATE POLICY "insert_own_answers" ON answers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM attempts WHERE attempts.id = answers.attempt_id AND attempts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_answers" ON answers;
CREATE POLICY "update_own_answers" ON answers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM attempts WHERE attempts.id = answers.attempt_id AND attempts.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM attempts WHERE attempts.id = answers.attempt_id AND attempts.user_id = auth.uid())
  );

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  overall_band numeric(2,1),
  listening_band numeric(2,1),
  reading_band numeric(2,1),
  writing_band numeric(2,1),
  speaking_band numeric(2,1),
  correct_answers integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  accuracy numeric(5,2) DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_results" ON results;
CREATE POLICY "select_own_results" ON results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_results" ON results;
CREATE POLICY "insert_own_results" ON results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_results" ON results;
CREATE POLICY "update_own_results" ON results FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Writing submissions
CREATE TABLE IF NOT EXISTS writing_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid REFERENCES tests(id) ON DELETE SET NULL,
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
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE writing_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_writing" ON writing_submissions;
CREATE POLICY "select_own_writing" ON writing_submissions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_writing" ON writing_submissions;
CREATE POLICY "insert_own_writing" ON writing_submissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_writing" ON writing_submissions;
CREATE POLICY "update_own_writing" ON writing_submissions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Speaking submissions
CREATE TABLE IF NOT EXISTS speaking_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id uuid REFERENCES tests(id) ON DELETE SET NULL,
  part text NOT NULL CHECK (part IN ('part1', 'part2', 'part3')),
  prompt text NOT NULL,
  recording_url text,
  duration_seconds integer DEFAULT 0,
  overall_band numeric(2,1),
  fluency numeric(2,1),
  lexical_resource numeric(2,1),
  grammatical_range numeric(2,1),
  pronunciation numeric(2,1),
  ai_report jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluated', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE speaking_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_speaking" ON speaking_submissions;
CREATE POLICY "select_own_speaking" ON speaking_submissions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_speaking" ON speaking_submissions;
CREATE POLICY "insert_own_speaking" ON speaking_submissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_speaking" ON speaking_submissions;
CREATE POLICY "update_own_speaking" ON speaking_submissions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Vocabulary progress
CREATE TABLE IF NOT EXISTS vocabulary_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  word text NOT NULL,
  definition text,
  mastery_level integer NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  next_review date DEFAULT CURRENT_DATE,
  review_count integer DEFAULT 0,
  correct_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, word)
);

ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_vocab" ON vocabulary_progress;
CREATE POLICY "select_own_vocab" ON vocabulary_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_vocab" ON vocabulary_progress;
CREATE POLICY "insert_own_vocab" ON vocabulary_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_vocab" ON vocabulary_progress;
CREATE POLICY "update_own_vocab" ON vocabulary_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_vocab" ON vocabulary_progress;
CREATE POLICY "delete_own_vocab" ON vocabulary_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Mistakes
CREATE TABLE IF NOT EXISTS mistakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  your_answer text,
  correct_answer text NOT NULL,
  explanation text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  difficulty text NOT NULL DEFAULT 'medium',
  skill text NOT NULL CHECK (skill IN ('reading', 'listening', 'writing', 'speaking')),
  mastered boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mistakes" ON mistakes;
CREATE POLICY "select_own_mistakes" ON mistakes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_mistakes" ON mistakes;
CREATE POLICY "insert_own_mistakes" ON mistakes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_mistakes" ON mistakes;
CREATE POLICY "update_own_mistakes" ON mistakes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_mistakes" ON mistakes;
CREATE POLICY "delete_own_mistakes" ON mistakes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE (user_id, achievement_key)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_achievements" ON user_achievements;
CREATE POLICY "select_own_achievements" ON user_achievements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_achievements" ON user_achievements;
CREATE POLICY "insert_own_achievements" ON user_achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test ON attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_writing_user ON writing_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_speaking_user ON speaking_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_progress_user ON vocabulary_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_user ON mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_test ON sections(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section_id);
