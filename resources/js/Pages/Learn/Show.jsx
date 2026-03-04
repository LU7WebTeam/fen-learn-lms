import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

const LESSON_ICONS = { video: Video, text: FileText, quiz: HelpCircle };

// ─── Video player ─────────────────────────────────────────────────────────────

function getYouTubeId(url) {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    return m ? m[1] : null;
}

function getVimeoId(url) {
    const m = url.match(/vimeo\.com\/(\d+)/);
    return m ? m[1] : null;
}

function VideoPlayer({ url }) {
    if (!url) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground">No video URL set for this lesson.</p>
            </div>
        );
    }
    const ytId = getYouTubeId(url);
    if (ytId) {
        return (
            <div className="aspect-video overflow-hidden rounded-xl">
                <iframe
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }
    const vimeoId = getVimeoId(url);
    if (vimeoId) {
        return (
            <div className="aspect-video overflow-hidden rounded-xl">
                <iframe
                    className="h-full w-full"
                    src={`https://player.vimeo.com/video/${vimeoId}`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }
    return (
        <div className="overflow-hidden rounded-xl bg-black">
            <video src={url} controls className="aspect-video w-full" />
        </div>
    );
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const PASS_THRESHOLD = 0.7;

function QuizPlayer({ lesson, onPass }) {
    let questions = [];
    try {
        const parsed = JSON.parse(lesson.content || '{}');
        questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    } catch { /* empty */ }

    const [answers, setAnswers]     = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore]         = useState(null);

    function handleSubmit() {
        let correct = 0;
        questions.forEach((q, i) => {
            if (answers[i] === q.correct) correct++;
        });
        const pct = questions.length > 0 ? correct / questions.length : 0;
        setScore({ correct, total: questions.length, pct });
        setSubmitted(true);
        if (pct >= PASS_THRESHOLD) onPass();
    }

    function handleRetry() {
        setAnswers({});
        setSubmitted(false);
        setScore(null);
    }

    if (questions.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">This quiz has no questions yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {submitted && score && (
                <div className={cn(
                    'rounded-xl border p-5 text-center',
                    score.pct >= PASS_THRESHOLD
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                )}>
                    <p className="text-2xl font-bold mb-1">
                        {score.correct} / {score.total}
                    </p>
                    <p className="text-sm">
                        {score.pct >= PASS_THRESHOLD
                            ? 'Great job! You passed this quiz.'
                            : `You need ${Math.ceil(PASS_THRESHOLD * 100)}% to pass. Try again!`}
                    </p>
                    {score.pct < PASS_THRESHOLD && (
                        <Button onClick={handleRetry} variant="outline" size="sm" className="mt-3">
                            Try Again
                        </Button>
                    )}
                </div>
            )}

            {questions.map((q, qi) => (
                <div key={qi} className="space-y-3">
                    <p className="font-medium">
                        <span className="mr-2 text-muted-foreground">Q{qi + 1}.</span>
                        {q.question}
                    </p>
                    <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                            const chosen  = answers[qi] === oi;
                            const correct = submitted && oi === q.correct;
                            const wrong   = submitted && chosen && oi !== q.correct;

                            return (
                                <label
                                    key={oi}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors',
                                        !submitted && chosen && 'border-primary bg-primary/5',
                                        !submitted && !chosen && 'hover:bg-muted/50',
                                        correct  && 'border-green-500 bg-green-50 text-green-800',
                                        wrong    && 'border-red-400 bg-red-50 text-red-800',
                                        submitted && 'cursor-default'
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name={`q-${qi}`}
                                        value={oi}
                                        disabled={submitted}
                                        checked={chosen}
                                        onChange={() => setAnswers({ ...answers, [qi]: oi })}
                                        className="accent-primary"
                                    />
                                    <span className="flex-1">{opt}</span>
                                    {correct && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}

            {!submitted && (
                <Button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length < questions.length}
                    className="w-full"
                    size="lg"
                >
                    Submit Quiz
                </Button>
            )}
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function SidebarContent({ course, lesson, completedIds, enrollment }) {
    return (
        <div className="flex h-full flex-col">
            {/* Course header */}
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

            {/* Lesson list */}
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

export default function LearnShow({ course, lesson, enrollment, completedIds, isCompleted, nextLesson, prevLesson }) {
    const [completed, setCompleted] = useState(isCompleted);
    const [completing, setCompleting] = useState(false);

    const handleComplete = useCallback(() => {
        if (completed || completing) return;
        setCompleting(true);
        router.post(
            route('learn.complete', [course.slug, lesson.id]),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCompleted(true);
                    setCompleting(false);
                },
                onError: () => setCompleting(false),
            }
        );
    }, [completed, completing, course.slug, lesson.id]);

    function goNext() {
        if (nextLesson) router.get(route('learn.lesson', [course.slug, nextLesson.id]));
    }

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
                                completedIds={completed ? [...completedIds, lesson.id] : completedIds}
                                enrollment={enrollment}
                            />
                        </SheetContent>
                    </Sheet>

                    <Link href={route('courses.show', course.slug)} className="flex items-center gap-2 text-sm font-medium hover:underline">
                        <GraduationCap className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline line-clamp-1 max-w-xs">{course.title}</span>
                    </Link>

                    <div className="ml-auto flex items-center gap-2">
                        {completed && (
                            <Badge variant="outline" className="hidden gap-1 text-green-600 border-green-300 sm:flex">
                                <Check className="h-3.5 w-3.5" />
                                Completed
                            </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">{enrollment.progress}%</span>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar — desktop only */}
                    <aside className="hidden w-72 shrink-0 overflow-y-auto border-r lg:block">
                        <SidebarContent
                            course={course}
                            lesson={lesson}
                            completedIds={completed ? [...completedIds, lesson.id] : completedIds}
                            enrollment={enrollment}
                        />
                    </aside>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
                            {/* Lesson header */}
                            <div className="mb-6 flex items-center gap-2">
                                <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
                            </div>

                            {/* ── Video ── */}
                            {lesson.type === 'video' && (
                                <div className="space-y-6">
                                    <VideoPlayer url={lesson.video_url} />
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
                                <QuizPlayer lesson={lesson} onPass={handleComplete} />
                            )}

                            <Separator className="my-8" />

                            {/* Bottom nav */}
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
                                    {lesson.type !== 'quiz' && (
                                        completed ? (
                                            <Badge variant="outline" className="gap-1.5 text-green-600 border-green-300 px-3 py-1.5">
                                                <Check className="h-4 w-4" />
                                                Lesson Complete
                                            </Badge>
                                        ) : (
                                            <Button
                                                onClick={handleComplete}
                                                disabled={completing}
                                                variant="outline"
                                            >
                                                {completing ? 'Saving…' : 'Mark as Complete'}
                                            </Button>
                                        )
                                    )}

                                    {nextLesson ? (
                                        <Button onClick={goNext}>
                                            Next
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    ) : enrollment.completed_at || (completed && !nextLesson) ? (
                                        <Button asChild variant="default">
                                            <Link href={route('courses.show', course.slug)}>
                                                <Award className="mr-2 h-4 w-4" />
                                                Course Complete!
                                            </Link>
                                        </Button>
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
