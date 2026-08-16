'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Volume2, Bookmark, ArrowLeft, ArrowRight, RotateCw, Check, X, Brain } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface VocabWord {
  id: string;
  word: string;
  pronunciation: string | null;
  part_of_speech: string | null;
  definition: string;
  uzbek_translation: string | null;
  example_sentence: string | null;
  synonyms: string[] | null;
  antonyms: string[] | null;
  word_family: any;
  ielts_usage: string | null;
  category: string;
  cefr_level: string | null;
  ielts_band: string | null;
  difficulty: string;
}

const categories = ['all', 'academic', 'education', 'environment', 'technology', 'health', 'science', 'society', 'government', 'economy', 'business', 'travel', 'culture', 'media', 'crime', 'globalization', 'work', 'family', 'transport'];

export default function VocabularyPage() {
  const { user } = useAuth();
  const [words, setWords] = useState<VocabWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState<'library' | 'flashcards' | 'quiz'>('library');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      let query = supabase.from('vocabulary_words').select('*');
      if (category !== 'all') query = query.eq('category', category);
      if (search) query = query.ilike('word', `%${search}%`);
      const { data } = await query.order('word', { ascending: true }).limit(100);
      setWords(data || []);
      setLoading(false);
    })();
  }, [category, search]);

  const updateReviewStatus = useCallback(async (wordId: string, status: string) => {
    if (!user) return;
    const word = words.find((w) => w.id === wordId);
    if (!word) return;

    const intervals: Record<string, number> = { know: 7, learning: 3, difficult: 1, review: 2 };
    const masteryMap: Record<string, number> = { know: 4, learning: 2, difficult: 1, review: 3 };

    const { data: existing } = await supabase
      .from('vocabulary_reviews')
      .select('id, review_count, correct_count')
      .eq('user_id', user.id)
      .eq('vocabulary_word_id', wordId)
      .maybeSingle();

    if (existing) {
      await supabase.from('vocabulary_reviews').update({
        status,
        mastery_level: masteryMap[status] || 0,
        next_review_date: new Date(Date.now() + (intervals[status] || 1) * 86400000).toISOString().split('T')[0],
        review_interval_days: intervals[status] || 1,
        review_count: existing.review_count + 1,
        correct_count: status === 'know' ? existing.correct_count + 1 : existing.correct_count,
        last_reviewed_at: new Date().toISOString(),
      }).eq('id', existing.id);
    } else {
      await supabase.from('vocabulary_reviews').insert({
        user_id: user.id,
        vocabulary_word_id: wordId,
        status,
        mastery_level: masteryMap[status] || 0,
        next_review_date: new Date(Date.now() + (intervals[status] || 1) * 86400000).toISOString().split('T')[0],
        review_interval_days: intervals[status] || 1,
        review_count: 1,
        correct_count: status === 'know' ? 1 : 0,
        last_reviewed_at: new Date().toISOString(),
      });
    }
    setReviewStatuses((prev) => ({ ...prev, [wordId]: status }));
  }, [user, words]);

  const quizWords = words.slice(0, 10);
  const quizScore = quizWords.filter((w) => {
    const ua = quizAnswers[w.id];
    return ua && ua.toLowerCase().trim() === w.definition.toLowerCase().trim();
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">IELTS Vocabulary</h1>
        <p className="mt-1 text-sm text-muted-foreground">Master essential IELTS vocabulary with flashcards, quizzes, and spaced repetition.</p>
      </div>

      {/* View tabs */}
      <div className="flex gap-2">
        {[
          { key: 'library', label: 'Library' },
          { key: 'flashcards', label: 'Flashcards' },
          { key: 'quiz', label: 'Quiz' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setView(t.key as any); setFlashcardIndex(0); setFlashcardFlipped(false); setQuizSubmitted(false); setQuizAnswers({}); }}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              view === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Library view */}
      {view === 'library' && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search words..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="capitalize">{c === 'all' ? 'All categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="animate-pulse text-muted-foreground">Loading vocabulary...</div>
          ) : words.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No words found. Try a different search or category.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {words.map((w) => (
                <div key={w.id} className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{w.word}</h3>
                      {w.pronunciation && <p className="text-xs text-muted-foreground">{w.pronunciation}</p>}
                    </div>
                    <div className="flex gap-1">
                      {w.cefr_level && <Badge variant="secondary" className="text-xs">{w.cefr_level}</Badge>}
                      {w.ielts_band && <Badge className="text-xs">B{w.ielts_band}</Badge>}
                    </div>
                  </div>
                  {w.part_of_speech && <p className="mt-1 text-xs italic text-muted-foreground">{w.part_of_speech}</p>}
                  <p className="mt-2 text-sm">{w.definition}</p>
                  {w.uzbek_translation && <p className="mt-1 text-sm text-muted-foreground">{w.uzbek_translation}</p>}
                  {w.example_sentence && (
                    <p className="mt-3 rounded-lg bg-muted/30 p-2 text-xs italic text-muted-foreground">"{w.example_sentence}"</p>
                  )}
                  {w.synonyms && w.synonyms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {w.synonyms.slice(0, 4).map((s) => (
                        <span key={s} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant={reviewStatuses[w.id] === 'know' ? 'default' : 'outline'} onClick={() => updateReviewStatus(w.id, 'know')} className="flex-1">
                      <Check className="h-3 w-3" /> Know
                    </Button>
                    <Button size="sm" variant={reviewStatuses[w.id] === 'learning' ? 'default' : 'outline'} onClick={() => updateReviewStatus(w.id, 'learning')} className="flex-1">
                      <Brain className="h-3 w-3" /> Learning
                    </Button>
                    <Button size="sm" variant={reviewStatuses[w.id] === 'difficult' ? 'destructive' : 'outline'} onClick={() => updateReviewStatus(w.id, 'difficult')} className="flex-1">
                      <X className="h-3 w-3" /> Hard
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Flashcards view */}
      {view === 'flashcards' && (
        <div className="mx-auto max-w-2xl">
          {words.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No words available for flashcards.
            </div>
          ) : (
            <>
              <div className="mb-4 text-center text-sm text-muted-foreground">
                Card {flashcardIndex + 1} of {words.length}
              </div>
              <div
                className="relative h-80 cursor-pointer perspective-1000"
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
              >
                <div className={cn('absolute inset-0 rounded-3xl border-2 border-border bg-card p-8 transition-all', flashcardFlipped ? 'opacity-0 rotate-y-180' : 'opacity-100')}>
                  <div className="flex h-full flex-col items-center justify-center">
                    <h2 className="text-4xl font-bold">{words[flashcardIndex]?.word}</h2>
                    {words[flashcardIndex]?.pronunciation && (
                      <p className="mt-2 text-sm text-muted-foreground">{words[flashcardIndex].pronunciation}</p>
                    )}
                    {words[flashcardIndex]?.part_of_speech && (
                      <p className="mt-1 text-xs italic text-muted-foreground">{words[flashcardIndex].part_of_speech}</p>
                    )}
                    <p className="mt-6 text-xs text-muted-foreground">Click to flip</p>
                  </div>
                </div>
                {flashcardFlipped && (
                  <div className="absolute inset-0 rounded-3xl border-2 border-primary bg-card p-8">
                    <div className="flex h-full flex-col items-center justify-center space-y-3">
                      <p className="text-lg font-medium">{words[flashcardIndex]?.definition}</p>
                      {words[flashcardIndex]?.uzbek_translation && (
                        <p className="text-sm text-muted-foreground">{words[flashcardIndex].uzbek_translation}</p>
                      )}
                      {words[flashcardIndex]?.example_sentence && (
                        <p className="rounded-lg bg-muted/30 p-3 text-sm italic">"{words[flashcardIndex].example_sentence}"</p>
                      )}
                      {words[flashcardIndex]?.synonyms && words[flashcardIndex].synonyms.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1">
                          {words[flashcardIndex].synonyms.map((s) => (
                            <span key={s} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Button variant="outline" onClick={() => { setFlashcardIndex(Math.max(0, flashcardIndex - 1)); setFlashcardFlipped(false); }} disabled={flashcardIndex === 0}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateReviewStatus(words[flashcardIndex].id, 'difficult')}>
                    <X className="h-4 w-4" /> Difficult
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateReviewStatus(words[flashcardIndex].id, 'review')}>
                    <RotateCw className="h-4 w-4" /> Review
                  </Button>
                  <Button size="sm" onClick={() => updateReviewStatus(words[flashcardIndex].id, 'know')}>
                    <Check className="h-4 w-4" /> Know
                  </Button>
                </div>
                <Button variant="outline" onClick={() => { setFlashcardIndex(Math.min(words.length - 1, flashcardIndex + 1)); setFlashcardFlipped(false); }} disabled={flashcardIndex === words.length - 1}>
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Quiz view */}
      {view === 'quiz' && (
        <div className="mx-auto max-w-2xl space-y-6">
          {quizWords.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              No words available for quiz.
            </div>
          ) : quizSubmitted ? (
            <div className="rounded-3xl border border-border bg-card p-8 text-center">
              <h2 className="text-2xl font-bold">Quiz Complete!</h2>
              <div className="mt-4 text-5xl font-bold text-primary">{quizScore}/{quizWords.length}</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {quizScore === quizWords.length ? 'Perfect score! Excellent work!' : quizScore >= quizWords.length * 0.7 ? 'Great job! Keep it up!' : 'Keep practicing to improve your score.'}
              </p>
              <Button className="mt-6" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Match each word to its correct definition. 10 questions.</p>
              {quizWords.map((w, i) => (
                <div key={w.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
                    <span className="font-medium">{w.word}</span>
                    {w.part_of_speech && <span className="text-xs italic text-muted-foreground">{w.part_of_speech}</span>}
                  </div>
                  <Input
                    placeholder="Type the definition..."
                    value={quizAnswers[w.id] || ''}
                    onChange={(e) => setQuizAnswers({ ...quizAnswers, [w.id]: e.target.value })}
                    className="mt-3"
                  />
                </div>
              ))}
              <Button onClick={() => setQuizSubmitted(true)} className="w-full" size="lg">
                Submit Quiz
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
