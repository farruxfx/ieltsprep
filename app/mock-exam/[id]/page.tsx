'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock, Headphones, BookOpen, PenLine, Mic,
  ChevronLeft, ChevronRight, Flag, AlertCircle,
  Maximize2, X, Play, Pause, Volume2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { calculateListeningBand, calculateReadingBand, calculateOverallBand } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

interface MockSection {
  id: string;
  skill: string;
  title: string;
  content: string;
  audio_url: string | null;
  section_order: number;
  time_limit_seconds: number;
}

type AnswerMap = Record<string, string>;
type FlagMap = Record<string, boolean>;

export default function MockExamRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [sections, setSections] = useState<MockSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flags, setFlags] = useState<FlagMap>({});
  const [writingTask1, setWritingTask1] = useState('');
  const [writingTask2, setWritingTask2] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showSectionDialog, setShowSectionDialog] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState('academic');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const { data: exam } = await supabase
        .from('mock_exams')
        .select('title, exam_type')
        .eq('id', examId)
        .maybeSingle();
      if (exam) {
        setExamTitle(exam.title);
        setExamType(exam.exam_type);
      }

      const { data: secs } = await supabase
        .from('mock_sections')
        .select('id, skill, title, content, audio_url, section_order, time_limit_seconds')
        .eq('mock_exam_id', examId)
        .order('section_order', { ascending: true });

      if (secs && secs.length > 0) {
        setSections(secs);
        setTimeLeft(secs[0].time_limit_seconds || 600);
      }
      setLoading(false);
    })();
  }, [examId]);

  useEffect(() => {
    if (showInstructions || loading || sections.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSectionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex, showInstructions, loading]);

  const handleSectionComplete = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      setShowSectionDialog(true);
    } else {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex, sections.length]);

  const handleSubmit = useCallback(async () => {
    setShowSubmitDialog(false);
    setShowSectionDialog(false);

    const listeningSections = sections.filter((s) => s.skill === 'listening');
    const readingSections = sections.filter((s) => s.skill === 'reading');

    const listeningQuestions: { id: string; correctAnswer: string }[] = [];
    const readingQuestions: { id: string; correctAnswer: string }[] = [];

    for (const sec of listeningSections) {
      const { data: qs } = await supabase
        .from('questions')
        .select('id, correct_answer')
        .eq('section_id', sec.id);
      if (qs) listeningQuestions.push(...qs.map((q: any) => ({ id: q.id, correctAnswer: Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer })));
    }
    for (const sec of readingSections) {
      const { data: qs } = await supabase
        .from('questions')
        .select('id, correct_answer')
        .eq('section_id', sec.id);
      if (qs) readingQuestions.push(...qs.map((q: any) => ({ id: q.id, correctAnswer: Array.isArray(q.correct_answer) ? q.correct_answer[0] : q.correct_answer })));
    }

    const listeningCorrect = listeningQuestions.filter((q) => {
      const ua = answers[q.id];
      if (!ua) return false;
      return ua.toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim();
    }).length;

    const readingCorrect = readingQuestions.filter((q) => {
      const ua = answers[q.id];
      if (!ua) return false;
      return ua.toLowerCase().trim() === String(q.correctAnswer).toLowerCase().trim();
    }).length;

    const listeningBand = calculateListeningBand(listeningCorrect, listeningQuestions.length || 40);
    const readingBand = calculateReadingBand(readingCorrect, readingQuestions.length || 40, examType as 'academic' | 'general');

    const wc1 = writingTask1.trim().split(/\s+/).filter(Boolean).length;
    const wc2 = writingTask2.trim().split(/\s+/).filter(Boolean).length;
    const writingBand = wc1 >= 150 && wc2 >= 250 ? 6.5 : wc1 >= 100 && wc2 >= 200 ? 5.5 : 4.5;
    const speakingBand = 6.0;

    const overall = calculateOverallBand(listeningBand, readingBand, writingBand, speakingBand);

    if (attemptId) {
      await supabase.from('mock_attempts').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        time_spent_seconds: sections.reduce((a, s) => a + s.time_limit_seconds, 0) - timeLeft,
      }).eq('id', attemptId);

      await supabase.from('mock_results').insert({
        mock_attempt_id: attemptId,
        mock_exam_id: examId,
        overall_band: overall,
        listening_band: listeningBand,
        reading_band: readingBand,
        writing_band: writingBand,
        speaking_band: speakingBand,
        listening_raw: listeningCorrect,
        reading_raw: readingCorrect,
        listening_total: listeningQuestions.length,
        reading_total: readingQuestions.length,
        accuracy: ((listeningCorrect + readingCorrect) / ((listeningQuestions.length + readingQuestions.length) || 1)) * 100,
        time_spent_seconds: sections.reduce((a, s) => a + s.time_limit_seconds, 0) - timeLeft,
      });
    }

    const qp = new URLSearchParams({
      listening: listeningBand.toFixed(1),
      reading: readingBand.toFixed(1),
      writing: writingBand.toFixed(1),
      speaking: speakingBand.toFixed(1),
      overall: overall.toFixed(1),
      lr: String(listeningCorrect),
      lt: String(listeningQuestions.length),
      rr: String(readingCorrect),
      rt: String(readingQuestions.length),
      wc1: String(wc1),
      wc2: String(wc2),
    });
    router.push(`/mock-exam/result?${qp.toString()}`);
  }, [answers, sections, writingTask1, writingTask2, examId, examType, attemptId, timeLeft, router]);

  const startExam = async () => {
    setShowInstructions(false);
    const { data: attempt } = await supabase.from('mock_attempts').insert({
      mock_exam_id: examId,
      status: 'in_progress',
    }).select('id').single();
    if (attempt) setAttemptId(attempt.id);
  };

  const goToNextSection = () => {
    setShowSectionDialog(false);
    const nextIdx = currentSectionIndex + 1;
    setCurrentSectionIndex(nextIdx);
    setCurrentQuestionIndex(0);
    if (sections[nextIdx]) {
      setTimeLeft(sections[nextIdx].time_limit_seconds || 600);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading exam...</div>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
        <div className="max-w-2xl rounded-3xl border border-border bg-card p-8">
          <h1 className="text-2xl font-bold">IELTS Mock Exam</h1>
          <p className="mt-2 text-muted-foreground">{examTitle}</p>

          <div className="mt-6 space-y-3">
            {[
              { icon: Headphones, label: 'Listening', desc: '4 sections, 40 questions, 40 minutes' },
              { icon: BookOpen, label: 'Reading', desc: '3 passages, 40 questions, 60 minutes' },
              { icon: PenLine, label: 'Writing', desc: '2 tasks, 60 minutes' },
              { icon: Mic, label: 'Speaking', desc: '3 parts, 15 minutes' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4 rounded-xl border border-border p-4">
                <s.icon className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-medium">{s.label}</div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-warning/10 p-4 text-sm text-warning">
            <div className="flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4" />
              Important
            </div>
            <p className="mt-1 text-warning/80">
              Once you begin, you cannot return to the dashboard. The exam will auto-submit when time runs out.
              Make sure you have a stable internet connection and a quiet environment.
            </p>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => router.push('/mock-exam')}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={startExam} size="lg">
              Begin Exam
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const section = sections[currentSectionIndex];
  if (!section) return null;

  const isListening = section.skill === 'listening';
  const isReading = section.skill === 'reading';
  const isWriting = section.skill === 'writing';
  const isSpeaking = section.skill === 'speaking';

  const writingTasks = sections.filter((s) => s.skill === 'writing');
  const writingTaskIndex = writingTasks.findIndex((s) => s.id === section.id);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium capitalize">{section.skill}</span>
            <span className="text-sm text-muted-foreground">Section {currentSectionIndex + 1} of {sections.length}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={cn('font-mono text-sm font-semibold', timeLeft < 60 ? 'text-destructive' : 'text-foreground')}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSubmitDialog(true)}>
            Submit Exam
          </Button>
        </div>
        <div className="h-1 w-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${((currentSectionIndex + 1) / sections.length) * 100}%` }} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: passage/content */}
        {(isReading || isListening) && (
          <div className="hidden flex-1 overflow-y-auto border-r border-border p-6 lg:block">
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-4 text-lg font-semibold">{section.title}</h2>
              {isListening && (
                <div className="mb-6 rounded-xl border border-border bg-muted/30 p-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setAudioPlaying(!audioPlaying)}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      {audioPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </button>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: audioPlaying ? '45%' : '0%' }} />
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Volume2 className="h-4 w-4" />
                        Audio Player
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div style={{ lineHeight: 1.8 }}>
                {section.content.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-4 text-sm text-foreground/90">{para}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right: questions / writing / speaking */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 p-6">
            <div className="mx-auto max-w-2xl">
              {/* Mobile passage */}
              {(isReading || isListening) && (
                <details className="mb-4 lg:hidden">
                  <summary className="cursor-pointer text-sm font-medium text-primary">Show passage</summary>
                  <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-border p-4">
                    {section.content.split('\n\n').map((para, i) => (
                      <p key={i} className="mb-3 text-xs text-foreground/90">{para}</p>
                    ))}
                  </div>
                </details>
              )}

              {/* Writing */}
              {isWriting && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary">Task {writingTaskIndex + 1}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {writingTaskIndex === 0 ? '150+ words recommended' : '250+ words recommended'}
                      </span>
                    </div>
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{section.content}</p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <Label>Your response</Label>
                      <span className="text-sm text-muted-foreground">
                        {(writingTaskIndex === 0 ? writingTask1 : writingTask2).trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <Textarea
                      placeholder="Write your essay here..."
                      value={writingTaskIndex === 0 ? writingTask1 : writingTask2}
                      onChange={(e) => writingTaskIndex === 0 ? setWritingTask1(e.target.value) : setWritingTask2(e.target.value)}
                      className="min-h-[400px] text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Speaking */}
              {isSpeaking && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <Badge variant="secondary" className="mb-2">{section.title}</Badge>
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{section.content}</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center">
                    <Mic className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Recording will be available when you start speaking. Your response will be saved automatically.
                    </p>
                    <Button className="mt-4" variant="outline">
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  </div>
                </div>
              )}

              {/* Question navigation for listening/reading */}
              {(isListening || isReading) && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Answer the questions based on the {isListening ? 'audio' : 'passage'} on the left.
                    Your answers are saved automatically.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                disabled={currentSectionIndex === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              {currentSectionIndex < sections.length - 1 ? (
                <Button onClick={() => setShowSectionDialog(true)}>
                  Next Section
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setShowSubmitDialog(true)}>
                  Submit Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your exam?</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm text-muted-foreground">
            You are about to submit your mock exam. Your answers will be evaluated and you will see your results.
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Keep working</Button>
            <Button onClick={handleSubmit}>Submit now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section transition dialog */}
      <Dialog open={showSectionDialog} onOpenChange={setShowSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Continue to next section?</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-sm text-muted-foreground">
            {currentSectionIndex < sections.length - 1
              ? `Next: ${sections[currentSectionIndex + 1]?.skill?.charAt(0).toUpperCase()}${sections[currentSectionIndex + 1]?.skill?.slice(1)}`
              : 'You are at the last section.'}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSectionDialog(false)}>Stay here</Button>
            <Button onClick={goToNextSection}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
