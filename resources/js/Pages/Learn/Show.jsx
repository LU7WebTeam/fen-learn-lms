import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import BlockNoteRenderer from '@/Components/BlockNoteRenderer';
import VideoPlayer from '@/Components/VideoPlayer';
import UserMenu from '@/Components/UserMenu';
import LangSwitcher from '@/Components/LangSwitcher';
import { tl } from '@/lib/locale';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/Components/ui/sheet';
import {
    Check, ChevronLeft, ChevronRight, Menu,
    Video, FileText, HelpCircle, GraduationCap, Award, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LESSON_ICONS = { video: Video, text: FileText, quiz: HelpCircle, pdf: FileText };

const LEARNER_ACTIVITY_EVENT_LABELS = {
    enrollment_started: 'Enrollment Started',
    lesson_completed: 'Lesson Completed',
    quiz_attempt_submitted: 'Quiz Attempt Submitted',
    quiz_passed: 'Quiz Passed',
    quiz_failed: 'Quiz Failed',
    course_completed: 'Course Completed',
};

// ─── Quiz ─────────────────────────────────────────────────────────────────────

function QuizPlayer({ lesson, course, allAttempts = [], locale }) {
    const { flash } = usePage().props;
    const result = flash?.quiz_result ?? null;

    let quizData = { questions: [], passing_score: 70, max_attempts: 0 };
    try {
        quizData = JSON.parse(lesson.content || '{}');
        if (!Array.isArray(quizData.questions)) quizData.questions = [];
    } catch { /* empty */ }

    if (locale === 'ms' && lesson.content_ms) {
        try {
            const msData = JSON.parse(lesson.content_ms);
            if (Array.isArray(msData.questions)) {
                quizData = {
                    ...quizData,
                    questions: quizData.questions.map((enQ, i) => {
                        const msQ = msData.questions[i];
                        if (!msQ) return enQ;
                        return {
                            ...enQ,
                            text: msQ.text?.trim() || enQ.text,
                            options: enQ.options.map((enOpt, j) => {
                                const msOpt = msQ.options?.[j];
                                if (!msOpt || !String(msOpt).trim()) return enOpt;
                                if (typeof enOpt === 'object') return { ...enOpt, label: msOpt };
                                return msOpt;
                            }),
                        };
                    }),
                };
            }
        } catch { /* keep EN */ }
    }

    const questions    = quizData.questions;
    const passingScore = quizData.passing_score ?? 70;
    const maxAttempts  = quizData.max_attempts  ?? 0;
    const attemptsDone = allAttempts.length;
    const attemptsLeft = maxAttempts > 0 ? maxAttempts - attemptsDone : Infinity;
    const limitReached = maxAttempts > 0 && attemptsDone >= maxAttempts;

    const { data, setData, post, processing } = useForm({ answers: {} });

    function handleSubmit() {
        post(route('learn.quiz.submit', [course.slug, lesson.id]), {
            preserveScroll: true,
        });
    }

    function handleRetry() {
        setData('answers', {});
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
    const lastAttempt = allAttempts.length > 0 ? allAttempts[allAttempts.length - 1] : null;

    return (
        <div className="space-y-6">
            {/* Attempt counter */}
            {maxAttempts > 0 && !showResult && (
                <div className={cn(
                    'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
                    limitReached
                        ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                        : 'border-border bg-muted/40 text-muted-foreground'
                )}>
                    <Lock className="h-4 w-4 shrink-0" />
                    {limitReached
                        ? `You have used all ${maxAttempts} allowed attempt${maxAttempts !== 1 ? 's' : ''} for this quiz.`
                        : `${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining of ${maxAttempts} allowed`}
                </div>
            )}

            {/* Attempt history (shown before any submission this session) */}
            {!showResult && allAttempts.length > 0 && (
                <div className="rounded-lg border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b">
                        <p className="text-sm font-medium">Your attempt history</p>
                        <span className="text-xs text-muted-foreground">Best: {Math.max(...allAttempts.map(a => a.percentage))}%</span>
                    </div>
                    <div className="divide-y">
                        {allAttempts.map((a, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                                <span className="text-muted-foreground">Attempt {a.attempt_number}</span>
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:block w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={cn('h-full rounded-full', a.passed ? 'bg-green-500' : 'bg-amber-400')}
                                            style={{ width: `${a.percentage}%` }}
                                        />
                                    </div>
                                    <span className={cn('font-medium tabular-nums', a.passed ? 'text-green-600' : 'text-amber-600')}>
                                        {a.percentage}%
                                    </span>
                                    {a.passed
                                        ? <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                        : <span className="text-xs text-muted-foreground shrink-0">need {passingScore}%</span>}
                                    <span className="hidden md:block text-xs text-muted-foreground shrink-0">{a.created_at}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Previous attempt banner (shown before any submission, only when no history table) */}
            {!showResult && !allAttempts.length && lastAttempt && (
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
                    {!result.passed && (maxAttempts === 0 || (attemptsDone + 1) < maxAttempts) && (
                        <Button onClick={handleRetry} variant="outline" size="sm" className="mt-4">
                            Try Again
                        </Button>
                    )}
                    {!result.passed && maxAttempts > 0 && (attemptsDone + 1) >= maxAttempts && (
                        <p className="mt-3 text-sm text-muted-foreground">No more attempts allowed.</p>
                    )}
                </div>
            )}

            {/* Questions */}
            {(showResult ? result.results : questions).map((q, qi) => {
                const chosen    = showResult ? q.selected : data.answers[qi];
                const correct   = showResult ? q.correct  : null;
                const isImgQ    = q.type === 'image_choice';
                return (
                    <div key={qi} className="space-y-3">
                        <p className="font-medium">
                            <span className="mr-2 text-muted-foreground text-sm">Q{qi + 1}.</span>
                            {q.text ?? q.question}
                        </p>

                        {/* ── Text options ── */}
                        {!isImgQ && (
                        <div className="space-y-2">
                            {q.options.map((opt, oi) => {
                                const isChosen  = chosen === oi;
                                const isCorrect = showResult && oi === correct;
                                const isWrong   = showResult && isChosen && oi !== correct;
                                const optLabel  = typeof opt === 'object' ? (opt.label ?? '') : opt;
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
                                        <span className="flex-1">{optLabel}</span>
                                        {isCorrect && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                                    </label>
                                );
                            })}
                        </div>
                        )}

                        {/* ── Image choice options ── */}
                        {isImgQ && (
                            <div className="grid grid-cols-2 gap-3">
                                {q.options.map((opt, oi) => {
                                    const isChosen  = chosen === oi;
                                    const isCorrect = showResult && oi === correct;
                                    const isWrong   = showResult && isChosen && oi !== correct;
                                    const imgUrl    = typeof opt === 'object' ? opt.image_url : '';
                                    const label     = typeof opt === 'object' ? (opt.label || '') : '';
                                    return (
                                        <button
                                            key={oi}
                                            type="button"
                                            disabled={showResult}
                                            onClick={() => !showResult && setData('answers', { ...data.answers, [qi]: oi })}
                                            className={cn(
                                                'rounded-xl border-2 overflow-hidden text-left w-full transition-colors',
                                                !showResult && isChosen  && 'border-primary',
                                                !showResult && !isChosen && 'border-border hover:border-primary/50',
                                                isCorrect && 'border-green-500',
                                                isWrong   && 'border-red-400',
                                                showResult && 'cursor-default'
                                            )}
                                        >
                                            {imgUrl ? (
                                                <img src={imgUrl} alt={label || `Option ${oi + 1}`} className="aspect-video w-full object-cover" />
                                            ) : (
                                                <div className="flex aspect-video w-full items-center justify-center bg-muted text-muted-foreground text-xs">No image</div>
                                            )}
                                            <div className={cn('flex items-center justify-between px-2 py-1.5', isCorrect && 'bg-green-50 dark:bg-green-950/40', isWrong && 'bg-red-50 dark:bg-red-950/40')}>
                                                <span className={cn('text-xs font-medium', isCorrect && 'text-green-800 dark:text-green-300', isWrong && 'text-red-800 dark:text-red-300')}>
                                                    {label || `Option ${oi + 1}`}
                                                </span>
                                                {isCorrect && <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {!showResult && !limitReached && (
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

function SidebarContent({ course, lesson, completedIds, enrollment, lockedIds = [], locale }) {
    return (
        <div className="flex h-full flex-col">
            <div className="border-b px-4 py-4">
                <Link
                    href={route('courses.show', course.slug)}
                    className="flex items-center gap-2 text-sm font-semibold hover:underline"
                >
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{tl(course, 'title', locale)}</span>
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
                            {tl(section, 'title', locale)}
                        </p>
                        {section.lessons.map((l) => {
                            const Icon      = LESSON_ICONS[l.type] ?? FileText;
                            const isCurrent = l.id === lesson.id;
                            const isDone    = completedIds.includes(l.id);
                            const isLocked  = lockedIds.includes(l.id);
                            return (
                                <Link
                                    key={l.id}
                                    href={route('learn.lesson', [course.slug, l.id])}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                                        isCurrent
                                            ? 'bg-primary/10 font-medium text-primary'
                                            : isLocked
                                                ? 'text-muted-foreground/60 hover:bg-muted'
                                                : 'text-foreground hover:bg-muted'
                                    )}
                                >
                                    <span className="shrink-0">
                                        {isDone
                                            ? <Check className="h-4 w-4 text-green-500" />
                                            : isLocked
                                                ? <Lock className="h-4 w-4 text-muted-foreground/60" />
                                                : <Icon className="h-4 w-4 text-muted-foreground" />}
                                    </span>
                                    <span className="line-clamp-2 flex-1 leading-snug">{tl(l, 'title', locale)}</span>
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
    course, lesson, enrollment, completedIds, isCompleted, isLocked, prerequisiteLesson,
    nextLesson, prevLesson, allAttempts, learnerActivity,
}) {
    const { locale } = usePage().props;
    const [completed, setCompleted]     = useState(isCompleted);
    const [completing, setCompleting]   = useState(false);
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

    const canComplete = lesson.type === 'video' ? videoWatched : true;

    const effectiveCompletedIds = completed
        ? [...new Set([...completedIds, lesson.id])]
        : completedIds;

    // Compute which sidebar lessons are locked by a prerequisite
    const lockedIds = course.sections
        .flatMap(s => s.lessons)
        .filter(l => l.prerequisite_lesson_id && !effectiveCompletedIds.includes(l.prerequisite_lesson_id))
        .map(l => l.id);

    const Icon = LESSON_ICONS[lesson.type] ?? FileText;

    const lessonTitle = tl(lesson, 'title', locale);
    const courseTitle = tl(course, 'title', locale);

    return (
        <>
            <Head title={`${lessonTitle} — ${courseTitle}`} />

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
                                lockedIds={lockedIds}
                                locale={locale}
                            />
                        </SheetContent>
                    </Sheet>

                    <Link
                        href={route('courses.show', course.slug)}
                        className="flex items-center gap-2 text-sm font-medium hover:underline"
                    >
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline line-clamp-1 max-w-xs">{courseTitle}</span>
                    </Link>

                    <div className="ml-auto flex items-center gap-3">
                        {completed && (
                            <Badge variant="outline" className="hidden gap-1 text-green-600 border-green-300 sm:flex">
                                <Check className="h-3.5 w-3.5" />
                                Completed
                            </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                        <LangSwitcher />
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
                            lockedIds={lockedIds}
                            locale={locale}
                        />
                    </aside>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
                            {/* Lesson title */}
                            <div className="mb-6 flex items-center gap-2">
                                <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <h1 className="text-2xl font-bold tracking-tight">{lessonTitle}</h1>
                            </div>

                            {/* ── Locked state ── */}
                            {isLocked && (
                                <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
                                    <div className="rounded-full bg-muted p-4">
                                        <Lock className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">Lesson locked</h2>
                                        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                                            You need to complete
                                            {prerequisiteLesson
                                                ? <strong className="text-foreground"> "{prerequisiteLesson.title}" </strong>
                                                : ' the prerequisite lesson '}
                                            before you can access this lesson.
                                        </p>
                                    </div>
                                    {prerequisiteLesson && (
                                        <Link
                                            href={route('learn.lesson', [course.slug, prerequisiteLesson.id])}
                                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                        >
                                            Go to prerequisite lesson
                                            <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* ── Video ── */}
                            {lesson.type === 'video' && !isLocked && (() => {
                                const notes = tl(lesson, 'content', locale);
                                return (
                                    <div className="space-y-6">
                                        <VideoPlayer
                                            url={lesson.video_url}
                                            onWatchComplete={() => setVideoWatched(true)}
                                        />
                                        {notes && (
                                            <div>
                                                <h2 className="mb-3 text-base font-semibold">Notes</h2>
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* ── Text ── */}
                            {lesson.type === 'text' && !isLocked && (() => {
                                const rawContent = tl(lesson, 'content', locale);
                                if (!rawContent) {
                                    return <p className="text-muted-foreground">No content yet for this lesson.</p>;
                                }
                                try {
                                    const blocks = JSON.parse(rawContent);
                                    if (Array.isArray(blocks)) {
                                        return <BlockNoteRenderer content={blocks} />;
                                    }
                                } catch { /* not JSON */ }
                                return (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{rawContent}</ReactMarkdown>
                                    </div>
                                );
                            })()}

                            {/* ── Quiz ── */}
                            {lesson.type === 'quiz' && !isLocked && (
                                <QuizPlayer lesson={lesson} course={course} allAttempts={allAttempts ?? []} locale={locale} />
                            )}

                            {/* ── PDF ── */}
                            {lesson.type === 'pdf' && !isLocked && (() => {
                                const pdfDesc = tl(lesson, 'content', locale);
                                return (
                                    <div className="space-y-4">
                                        {lesson.pdf_url ? (
                                            <>
                                                <div className="overflow-hidden rounded-lg border bg-muted" style={{ height: '75vh' }}>
                                                    <iframe
                                                        src={lesson.pdf_url}
                                                        className="h-full w-full"
                                                        title={lessonTitle}
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
                                        {pdfDesc && (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{pdfDesc}</ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {!isLocked && Array.isArray(learnerActivity) && learnerActivity.length > 0 && (
                                <div className="mt-8 rounded-lg border">
                                    <div className="flex items-center justify-between border-b px-4 py-3">
                                        <h2 className="text-sm font-semibold">Your Activity in This Course</h2>
                                        <span className="text-xs text-muted-foreground">Latest {learnerActivity.length} events</span>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {learnerActivity.map((item) => (
                                            <div key={item.id} className="border-b px-4 py-3 last:border-b-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline">{LEARNER_ACTIVITY_EVENT_LABELS[item.event] ?? item.event}</Badge>
                                                    {item.properties?.lesson_title && (
                                                        <span className="text-sm font-medium">{item.properties.lesson_title}</span>
                                                    )}
                                                    {item.properties?.percentage !== null && item.properties?.percentage !== undefined && (
                                                        <span className="text-xs text-muted-foreground">Score: {item.properties.percentage}%</span>
                                                    )}
                                                    {typeof item.properties?.passed === 'boolean' && (
                                                        <span className={`text-xs ${item.properties.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                            {item.properties.passed ? 'Passed' : 'Failed'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-xs text-muted-foreground">{item.created_at}</div>
                                            </div>
                                        ))}
                                    </div>
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
                                    {prevLesson ? tl(prevLesson, 'title', locale) : 'Previous'}
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
