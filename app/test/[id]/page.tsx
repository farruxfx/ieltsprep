'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  StickyNote,
  Maximize2,
  X,
  AlertCircle,
} from 'lucide-react';
import { passages, questions } from '@/lib/data';
import type { Question } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const QUESTION_COUNT = 13;
const TIME_LIMIT_SECONDS = 60 * 60;

type AnswerMap = Record<string, string>;
type FlagMap = Record<string, boolean>;
type NoteMap = Record<string, string>;

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const passage = passages.p1;
  const allQuestions = questions['t1'] || [];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flags, setFlags] = useState<FlagMap>({});
  const [notes, setNotes] = useState<NoteMap>({});
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleFlag = (questionIndex: number) => {
    const q = allQuestions[questionIndex];
    if (!q) return;
    setFlags((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
  };

  const handlePassageMouseUp = () => {
    if (!highlightMode) return;
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 2) {
      setHighlights((prev) => [...prev, text]);
      setSelectedText(text);
    }
  };

  const handleSubmit = useCallback(() => {
    setShowSubmitDialog(false);
    const correct = allQuestions.filter((q) => {
      const userAnswer = answers[q.id];
      if (!userAnswer) return false;
      const correctAnswer = Array.isArray(q.correctAnswer) ? q.correctAnswer[0] : q.correctAnswer;
      return userAnswer.toLowerCase().trim() === String(correctAnswer).toLowerCase().trim();
    }).length;
    const total = allQuestions.length;
    const accuracy = Math.round((correct / total) * 100);
    const params = new URLSearchParams({
      correct: String(correct),
      total: String(total),
      accuracy: String(accuracy),
      time: String(TIME_LIMIT_SECONDS - timeLeft),
    });
    router.push(`/test/result?${params.toString()}`);
  }, [answers, allQuestions, timeLeft, router]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  const q = allQuestions[currentQuestion];
  if (!q) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Test not found or has no questions.</p>
          <Button onClick={() => router.push('/practice')} className="mt-4">
            Back to tests
          </Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Leave the test? Your progress will be lost.')) {
                  router.push('/practice');
                }
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Exit
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  'font-mono text-sm font-semibold',
                  timeLeft < 300 ? 'text-destructive' : 'text-foreground'
                )}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="hidden text-sm text-muted-foreground sm:block">
              Question {currentQuestion + 1} of {allQuestions.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHighlightMode(!highlightMode)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                highlightMode
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              title="Highlight text"
            >
              <Highlighter className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                showNotes ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              )}
              title="Notes"
            >
              <StickyNote className="h-4 w-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentQuestion + 1) / allQuestions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Passage */}
        <div className="hidden flex-1 overflow-y-auto border-r border-border p-6 lg:block">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-lg font-semibold">{passage.title}</h2>
            <div
              className="prose prose-sm max-w-none"
              onMouseUp={handlePassageMouseUp}
              style={{ lineHeight: 1.8 }}
            >
              {passage.content.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4 text-sm text-foreground/90">
                  {para}
                </p>
              ))}
            </div>
            {highlights.length > 0 && (
              <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
                <h4 className="mb-2 text-sm font-semibold">Highlights</h4>
                <ul className="space-y-1">
                  {highlights.map((h, i) => (
                    <li key={i} className="rounded bg-yellow-100 px-2 py-1 text-xs dark:bg-yellow-900/30">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right: Questions */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 p-6">
            <div className="mx-auto max-w-2xl">
              {/* Mobile passage toggle */}
              <details className="mb-4 lg:hidden">
                <summary className="cursor-pointer text-sm font-medium text-primary">
                  Show reading passage
                </summary>
                <div className="mt-3 max-h-96 overflow-y-auto rounded-lg border border-border p-4">
                  <h2 className="mb-3 text-sm font-semibold">{passage.title}</h2>
                  {passage.content.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-3 text-xs text-foreground/90" style={{ lineHeight: 1.7 }}>
                      {para}
                    </p>
                  ))}
                </div>
              </details>

              {/* Question */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {currentQuestion + 1}
                    </span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {q.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleFlag(currentQuestion)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
                      flags[q.id]
                        ? 'bg-warning/10 text-warning'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <Flag className={cn('h-4 w-4', flags[q.id] && 'fill-warning')} />
                    {flags[q.id] ? 'Flagged' : 'Flag'}
                  </button>
                </div>

                <p className="mt-4 text-base font-medium leading-relaxed">{q.prompt}</p>

                {/* Answer area based on question type */}
                <div className="mt-5">
                  {q.type === 'multiple_choice' && q.options && (
                    <RadioGroup
                      value={answers[q.id] || ''}
                      onValueChange={(val) => handleAnswer(q.id, val)}
                    >
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                            answers[q.id] === opt
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          )}
                        >
                          <RadioGroupItem value={opt} id={`opt-${i}`} />
                          <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-sm font-normal">
                            {opt}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {(q.type === 'true_false_not_given' || q.type === 'yes_no_not_given') && (
                    <RadioGroup
                      value={answers[q.id] || ''}
                      onValueChange={(val) => handleAnswer(q.id, val)}
                    >
                      <div className="flex gap-2">
                        {['True', 'False', 'Not Given'].map((opt) => (
                          <div
                            key={opt}
                            className={cn(
                              'flex-1 rounded-lg border p-3 text-center transition-colors',
                              answers[q.id] === opt
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-muted/50'
                            )}
                          >
                            <RadioGroupItem value={opt} id={`tf-${opt}`} className="peer sr-only" />
                            <Label
                              htmlFor={`tf-${opt}`}
                              className="cursor-pointer text-sm font-medium"
                            >
                              {opt}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {(q.type === 'sentence_completion' ||
                    q.type === 'short_answer' ||
                    q.type === 'summary_completion' ||
                    q.type === 'note_completion' ||
                    q.type === 'table_completion' ||
                    q.type === 'flowchart_completion' ||
                    q.type === 'diagram_label_completion') && (
                    <Input
                      placeholder="Type your answer..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswer(q.id, e.target.value)}
                      className="max-w-md"
                    />
                  )}

                  {q.type === 'matching_headings' && q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(q.id, opt)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                            answers[q.id] === opt
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                              answers[q.id] === opt
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/40'
                            )}
                          >
                            {answers[q.id] === opt && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
                          </span>
                          <span className="flex-1 text-sm font-normal">{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {(q.type === 'matching_information' || q.type === 'matching_features') && q.options && (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(q.id, opt)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                            answers[q.id] === opt
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                              answers[q.id] === opt
                                ? 'border-primary bg-primary'
                                : 'border-muted-foreground/40'
                            )}
                          >
                            {answers[q.id] === opt && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
                          </span>
                          <span className="flex-1 text-sm font-normal">{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes panel */}
                {showNotes && (
                  <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Your note
                    </Label>
                    <Textarea
                      placeholder="Add a note for this question..."
                      value={notes[q.id] || ''}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      className="mt-2 min-h-[80px] text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Question navigation grid */}
              <div className="mt-6 rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Question navigator</span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="h-2.5 w-2.5 rounded bg-primary" /> Answered
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="h-2.5 w-2.5 rounded bg-warning" /> Flagged
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="h-2.5 w-2.5 rounded border border-border" /> Unanswered
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-2 sm:grid-cols-13">
                  {allQuestions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                        i === currentQuestion
                          ? 'ring-2 ring-primary ring-offset-1'
                          : '',
                        flags[allQuestions[i].id]
                          ? 'bg-warning/20 text-warning'
                          : answers[allQuestions[i].id]
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="sticky bottom-0 border-t border-border bg-card px-6 py-4">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>

              <div className="hidden text-sm text-muted-foreground sm:block">
                {answeredCount} answered, {flaggedCount} flagged
              </div>

              {currentQuestion < allQuestions.length - 1 ? (
                <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => setShowSubmitDialog(true)}>
                  Submit test
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your test?</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              You have answered {answeredCount} out of {allQuestions.length} questions.
            </p>
            {answeredCount < allQuestions.length && (
              <div className="flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-sm text-warning">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  {allQuestions.length - answeredCount} questions are unanswered. You can still
                  submit, but unanswered questions will be marked as incorrect.
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Keep working
            </Button>
            <Button onClick={handleSubmit}>Submit now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
