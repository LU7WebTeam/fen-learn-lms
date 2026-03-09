import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VideoPlayer from '@/Components/VideoPlayer';
import UserMenu from '@/Components/UserMenu';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import {
    Check, ChevronLeft, ChevronRight, Menu,
    Video, FileText, HelpCircle, GraduationCap, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LESSON_ICONS = { video: Video, text: FileText, quiz: HelpCircle, pdf: FileText };

// ─── Quiz ─────────────────────────────────────────────────────────────────────

function QuizPlayer({ lesson, course, lastAttempt }) {
    const { flash } = usePage().props;
    const result = flash?.quiz_result ?? null;

    let quizData = { questions: [], passing_score: 70 };
    try {
        quizData = JSON.parse(lesson.content || '{}');
        if (!Array.isArray(quizData.questions)) quizData.questions = [];
    } catch { /* empty */ }

    const questions    = quizData.questions;
    const passingScore = quizData.passing_score ?? 70;

    const { data, setData, post, processing } = useForm({ answers: {} });

    function handleSubmit() {
        post(route('learn.quiz.submit', [course.slug, lesson.id]), {
            preserveScroll: true,
        });
    }

    function handleRetry() {
        setData('answers', {});
        // Clear flash by navigating to self (Inertia reload)
        router.reload({ only: ['flash'] });
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">This quiz has no questions yet.</p>
            </div>
        );
    }

    const showResult = !!result;

    return (
        <div className="space-y-6">
            {/* Previous attempt banner (shown before any submission this session) */}
            {!showResult && lastAttempt && (
                <div className={cn(
                    'rounded-lg border px-4 py-3 text-sm',
                    lastAttempt.passed
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                )}>
                    <span className="font-medium">Last attempt:</span> {lastAttempt.score}/{lastAttempt.max_score} ({lastAttempt.percentage}%)
                    {lastAttempt.passed ? ' — Passed ✓' : ` — Need ${passingScore}% to pass`}
                </div>
            )}

            {/* Result panel (shown after submission) */}
            {showResult && (
                <div className={cn(
                    'rounded-xl border p-6 text-center',
                    result.passed
                        ? 'border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800'
                        : 'border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800'
                )}>
                    <p className={cn('text-3xl font-bold mb-1', result.passed ? 'text-green-700' : 'text-red-700')}>
                        {result.score} / {result.max_score}
                    </p>
                    <p className={cn('text-sm font-medium mb-1', result.passed ? 'text-green-600' : 'text-red-600')}>
                        {result.percentage}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {result.passed
                            ? '🎉 Great job! You passed this quiz.'
                            : `You need ${result.passing_score}% to pass. Review the answers below and try again.`}
                    </p>
                    {!result.passed && (
                        <Button onClick={handleRetry} variant="outline" size="sm" className="mt-4">
                            Try Again
                        </Button>
                    )}
                </div>
            )}

            {/* Questions */}
            {(showResult ? result.results : questions).map((q, qi) => {
                const chosen  = showResult ? q.selected : data.answers[qi];
                const correct = showResult ? q.correct  : null;
                return (
                    <div key={qi} className="space-y-3">
                        <p className="font-medium">
                            <span className="mr-2 text-muted-foreground text-sm">Q{qi + 1}.</span>
                            {q.question}
                        </p>
                        <div className="space-y-2">
                            {q.options.map((opt, oi) => {
                                const isChosen      = chosen === oi;
                                const isCorrect     = showResult && oi === correct;
                                const isWrong       = showResult && isChosen && oi !== correct;
                                return (
                                    <label
                                        key={oi}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors',
                                            !showResult && isChosen  && 'border-primary bg-primary/5',
                                            !showResult && !isChosen && 'hover:bg-muted/50',
                                            isCorrect && 'border-green-500 bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300',
                                            isWrong   && 'border-red-400 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300',
                                            showResult && 'cursor-default'
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${qi}`}
                                            value={oi}
                                            disabled={showResult}
                                            checked={isChosen ?? false}
                                            onChange={() => setData('answers', { ...data.answers, [qi]: oi })}
                                            className="accent-primary shrink-0"
                                        />
                                        <span className="flex-1">{opt}</span>
                                        {isCorrect && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {!showResult && (
                <Button
                    onClick={handleSubmit}
                    disabled={processing || Object.keys(data.answers).length < questions.length}
                    className="w-full"
                    size="lg"
                >
                    {processing ? 'Submitting…' : `Submit Quiz (${Object.keys(data.answers).length}/${questions.length} answered)`}
                </Button>
            )}
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarContent({ course, lesson, completedIds, enrollment }) {
    return (
        <div className="flex h-full flex-col">
            <div className="border-b px-4 py-4">
                <Link
                    href={route('courses.show', course.slug)}
                    className="flex items-center gap-2 text-sm font-semibold hover:underline"
                >
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{course.title}</span>
                </Link>
                <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-1.5" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {course.sections.map((section) => (
                    <div key={section.id} className="mb-2">
                        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {section.title}
                        </p>
                        {section.lessons.map((l) => {
                            const Icon      = LESSON_ICONS[l.type] ?? FileText;
                            const isCurrent = l.id === lesson.id;
                            const isDone    = completedIds.includes(l.id);
                            return (
                                <Link
                                    key={l.id}
                                    href={route('learn.lesson', [course.slug, l.id])}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                                        isCurrent
                                            ? 'bg-primary/10 font-medium text-primary'
                                            : 'text-foreground hover:bg-muted'
                                    )}
                                >
                                    <span className="shrink-0">
                                        {isDone
                                            ? <Check className="h-4 w-4 text-green-500" />
                                            : <Icon className="h-4 w-4 text-muted-foreground" />}
                                    </span>
                                    <span className="line-clamp-2 flex-1 leading-snug">{l.title}</span>
                                    {l.duration_minutes > 0 && (
                                        <span className="shrink-0 text-xs text-muted-foreground">{l.duration_minutes}m</span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main Player ──────────────────────────────────────────────────────────────

export default function LearnShow({
    course, lesson, enrollment, completedIds, isCompleted, nextLesson, prevLesson, lastAttempt,
}) {
    const [completed, setCompleted]     = useState(isCompleted);
    const [completing, setCompleting]   = useState(false);
    // For video lessons: tracks whether the learner watched to the end
    const [videoWatched, setVideoWatched] = useState(isCompleted);

    const handleComplete = useCallback(() => {
        if (completed || completing) return;
        setCompleting(true);
        router.post(
            route('learn.complete', [course.slug, lesson.id]),
            {},
            {
                preserveScroll: true,
                onSuccess: () => { setCompleted(true); setCompleting(false); },
                onError:   () => setCompleting(false),
            }
        );
    }, [completed, completing, course.slug, lesson.id]);

    // canComplete: video lessons require the video to be watched first
    const canComplete = lesson.type === 'video' ? videoWatched : true;

    const effectiveCompletedIds = completed
        ? [...new Set([...completedIds, lesson.id])]
        : completedIds;

    const Icon = LESSON_ICONS[lesson.type] ?? FileText;

    return (
        <>
            <Head title={`${lesson.title} — ${course.title}`} />

            <div className="flex h-screen flex-col overflow-hidden bg-background">
                {/* Top bar */}
                <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80 p-0">
                            <SidebarContent
                                course={course}
                                lesson={lesson}
                                completedIds={effectiveCompletedIds}
                                enrollment={enrollment}
                            />
                        </SheetContent>
                    </Sheet>

                    <Link
                        href={route('courses.show', course.slug)}
                        className="flex items-center gap-2 text-sm font-medium hover:underline"
                    >
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline line-clamp-1 max-w-xs">{course.title}</span>
                    </Link>

                    <div className="ml-auto flex items-center gap-3">
                        {completed && (
                            <Badge variant="outline" className="hidden gap-1 text-green-600 border-green-300 sm:flex">
                                <Check className="h-3.5 w-3.5" />
                                Completed
                            </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                        <UserMenu />
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar — desktop */}
                    <aside className="hidden w-72 shrink-0 overflow-y-auto border-r lg:block">
                        <SidebarContent
                            course={course}
                            lesson={lesson}
                            completedIds={effectiveCompletedIds}
                            enrollment={enrollment}
                        />
                    </aside>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
                            {/* Lesson title */}
                            <div className="mb-6 flex items-center gap-2">
                                <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
                            </div>

                            {/* ── Video ── */}
                            {lesson.type === 'video' && (
                                <div className="space-y-6">
                                    <VideoPlayer
                                        url={lesson.video_url}
                                        onWatchComplete={() => setVideoWatched(true)}
                                    />
                                    {lesson.content && (
                                        <div>
                                            <h2 className="mb-3 text-base font-semibold">Notes</h2>
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {lesson.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Text ── */}
                            {lesson.type === 'text' && (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    {lesson.content
                                        ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
                                        : <p className="text-muted-foreground">No content yet for this lesson.</p>}
                                </div>
                            )}

                            {/* ── Quiz ── */}
                            {lesson.type === 'quiz' && (
                                <QuizPlayer lesson={lesson} course={course} lastAttempt={lastAttempt} />
                            )}

                            {/* ── PDF ── */}
                            {lesson.type === 'pdf' && (
                                <div className="space-y-4">
                                    {lesson.pdf_url ? (
                                        <>
                                            <div className="overflow-hidden rounded-lg border bg-muted" style={{ height: '75vh' }}>
                                                <iframe
                                                    src={lesson.pdf_url}
                                                    className="h-full w-full"
                                                    title={lesson.title}
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <a
                                                    href={lesson.pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    Open in new tab ↗
                                                </a>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-muted-foreground">No PDF attached to this lesson yet.</p>
                                    )}
                                    {lesson.content && (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Separator className="my-8" />

                            {/* Bottom navigation */}
                            <div className="flex items-center justify-between gap-4">
                                <Button
                                    variant="outline"
                                    disabled={!prevLesson}
                                    onClick={() => prevLesson && router.get(route('learn.lesson', [course.slug, prevLesson.id]))}
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    {prevLesson ? prevLesson.title : 'Previous'}
                                </Button>

                                <div className="flex items-center gap-3">
                                    {/* Complete button — video & text only */}
                                    {lesson.type !== 'quiz' && (
                                        completed ? (
                                            <Badge variant="outline" className="gap-1.5 text-green-600 border-green-300 px-3 py-1.5">
                                                <Check className="h-4 w-4" />
                                                Lesson Complete
                                            </Badge>
                                        ) : (
                                            <Button
                                                onClick={handleComplete}
                                                disabled={completing || !canComplete}
                                                variant={canComplete ? 'default' : 'outline'}
                                                title={!canComplete ? 'Watch the full video to unlock' : undefined}
                                            >
                                                {completing
                                                    ? 'Saving…'
                                                    : canComplete
                                                        ? 'Mark as Complete'
                                                        : 'Watch video to continue'}
                                            </Button>
                                        )
                                    )}

                                    {/* Next / Course complete */}
                                    {nextLesson ? (
                                        <Button onClick={() => router.get(route('learn.lesson', [course.slug, nextLesson.id]))}>
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    ) : (enrollment.completed_at || (completed && !nextLesson)) ? (
                                        enrollment.certificate_uuid ? (
                                            <Button asChild className="bg-[#8B1A4A] hover:bg-[#7a1740] text-white">
                                                <Link href={`/certificate/${enrollment.certificate_uuid}`}>
                                                    <Award className="mr-2 h-4 w-4" />
                                                    Get Certificate
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button asChild>
                                                <Link href={route('courses.show', course.slug)}>
                                                    <Award className="mr-2 h-4 w-4" />
                                                    Course Complete!
                                                </Link>
                                            </Button>
                                        )
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
