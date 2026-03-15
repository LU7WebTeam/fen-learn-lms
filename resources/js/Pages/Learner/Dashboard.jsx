import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { BookOpen, Play, Award, GraduationCap, Sun, Sunset, Moon, TrendingUp, CheckCircle2, Library } from 'lucide-react';
import { useT } from '@/lib/i18n';

const difficultyColors = {
    beginner:     'secondary',
    intermediate: 'default',
    advanced:     'destructive',
};

const LEARNER_ACTIVITY_EVENT_LABELS = {
    enrollment_started: 'Enrollment Started',
    lesson_completed: 'Lesson Completed',
    quiz_attempt_submitted: 'Quiz Attempt Submitted',
    quiz_passed: 'Quiz Passed',
    quiz_failed: 'Quiz Failed',
    course_completed: 'Course Completed',
};

function renderActivityResult(item) {
    const hasScore = item.properties?.percentage !== null && item.properties?.percentage !== undefined;
    const hasPassed = typeof item.properties?.passed === 'boolean';

    if (!hasScore && !hasPassed) {
        return '-';
    }

    if (hasScore && hasPassed) {
        return `${item.properties.percentage}% (${item.properties.passed ? 'Passed' : 'Failed'})`;
    }

    if (hasScore) {
        return `${item.properties.percentage}%`;
    }

    return item.properties.passed ? 'Passed' : 'Failed';
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return { key: 'dashboard.greeting.morning', Icon: Sun,     color: 'text-yellow-500' };
    if (h < 18) return { key: 'dashboard.greeting.afternoon', Icon: Sunset, color: 'text-orange-500' };
    return             { key: 'dashboard.greeting.evening',   Icon: Moon,   color: 'text-indigo-400' };
}

function WelcomeHero({ user, inProgress, completed }) {
    const { key, Icon, color } = getGreeting();
    const t = useT();
    const greetingText = t(key);
    const firstName = user?.name?.split(' ')[0] ?? 'there';
    const totalEnrolled = inProgress.length + completed.length;
    const activeCount   = inProgress.filter(e => e.progress > 0 && !e.is_completed).length;

    return (
        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 mb-8">
            <CardContent className="pt-6 pb-6">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    {/* Greeting */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Icon className={`h-6 w-6 ${color}`} />
                            <h1 className="text-2xl font-bold tracking-tight">
                                {greetingText}, {firstName}!
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {activeCount > 0
                                ? t(activeCount !== 1 ? 'dashboard.hero.active_p' : 'dashboard.hero.active_s', { n: activeCount })
                                : totalEnrolled === 0
                                    ? t('dashboard.hero.no_enrollments')
                                    : t('dashboard.hero.all_caught_up')}
                        </p>
                    </div>

                    {/* Shortcuts */}
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                        <Button asChild size="sm" variant="outline">
                            <Link href="/courses">
                                <Library className="mr-2 h-4 w-4" />
                                {t('dashboard.hero.browse_catalog')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stat chips */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-lg border bg-background/80 px-4 py-3 text-center">
                        <GraduationCap className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                        <div className="text-xl font-bold">{totalEnrolled}</div>
                        <div className="text-xs text-muted-foreground">{t('dashboard.hero.enrolled')}</div>
                    </div>
                    <div className="rounded-lg border bg-background/80 px-4 py-3 text-center">
                        <TrendingUp className="mx-auto mb-1 h-5 w-5 text-primary" />
                        <div className="text-xl font-bold">{inProgress.length}</div>
                        <div className="text-xs text-muted-foreground">{t('dashboard.hero.in_progress')}</div>
                    </div>
                    <div className="rounded-lg border bg-background/80 px-4 py-3 text-center">
                        <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-500" />
                        <div className="text-xl font-bold">{completed.length}</div>
                        <div className="text-xs text-muted-foreground">{t('dashboard.hero.completed')}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ContinueLearning({ inProgress }) {
    const t = useT();
    // Pick the furthest-along incomplete course as the "continue" candidate
    const active = inProgress
        .filter(e => e.progress > 0 && e.progress < 100)
        .sort((a, b) => b.progress - a.progress)[0];

    if (!active) return null;

    const { course, progress, last_lesson_id } = active;
    const resumeHref = last_lesson_id
        ? `/learn/${course.slug}/lesson/${last_lesson_id}`
        : `/learn/${course.slug}`;

    return (
        <Card className="mb-8 overflow-hidden border-primary/30">
            <div className="flex flex-col sm:flex-row">
                {course.cover_image ? (
                    <img src={course.cover_image} alt={course.title} className="h-36 w-full object-cover sm:h-auto sm:w-48 sm:shrink-0" />
                ) : (
                    <div className="flex h-36 w-full items-center justify-center bg-muted sm:h-auto sm:w-48 sm:shrink-0">
                        <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                )}
                <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">{t('dashboard.continue.heading')}</p>
                        <h3 className="text-lg font-semibold leading-snug">{course.title}</h3>
                        {course.category && <p className="text-sm text-muted-foreground mt-0.5">{course.category}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{t('dashboard.continue.progress')}</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                    <div>
                        <Button asChild size="sm">
                            <Link href={resumeHref}>
                                <Play className="mr-2 h-3.5 w-3.5" />
                                {t('dashboard.continue.resume')}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}



function CourseCard({ enrollment, completed = false }) {
    const { course, progress, last_lesson_id, certificate_uuid } = enrollment;
    const t = useT();

    return (
        <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
            {course.cover_image ? (
                <img
                    src={course.cover_image}
                    alt={course.title}
                    className="h-40 w-full object-cover"
                />
            ) : (
                <div className="flex h-40 w-full items-center justify-center bg-muted">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
            )}

            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base">{course.title}</CardTitle>
                    <Badge variant={difficultyColors[course.difficulty] || 'secondary'} className="shrink-0 capitalize">
                        {course.difficulty}
                    </Badge>
                </div>
                {course.category && (
                    <CardDescription>{course.category}</CardDescription>
                )}
            </CardHeader>

            <CardContent className="flex-1 pb-2">
                {!completed && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{t('dashboard.card.progress')}</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}
                {completed && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <Award className="h-4 w-4" />
                        <span className="font-medium">{t('dashboard.card.completed')}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="gap-2">
                {!completed && (
                    <Button asChild size="sm" className="flex-1">
                        <Link href={last_lesson_id
                            ? `/learn/${course.slug}/lesson/${last_lesson_id}`
                            : `/learn/${course.slug}`}
                        >
                            <Play className="mr-1 h-3.5 w-3.5" />
                            {progress > 0 ? t('dashboard.card.resume') : t('dashboard.card.start')}
                        </Link>
                    </Button>
                )}
                {completed && certificate_uuid && (
                    <Button asChild variant="outline" size="sm" className="flex-1 border-[#8B1A4A] text-[#8B1A4A] hover:bg-[#8B1A4A] hover:text-white">
                        <Link href={`/certificate/${certificate_uuid}`}>
                            <Award className="mr-1 h-3.5 w-3.5" />
                            {t('dashboard.card.view_certificate')}
                        </Link>
                    </Button>
                )}
                {completed && (
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                        <Link href={`/learn/${course.slug}`}>
                            {t('dashboard.card.review')}
                        </Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

function EmptyState({ message, actionLabel, actionHref }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">{message}</p>
            {actionLabel && (
                <Button asChild>
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    );
}

export default function Dashboard({ inProgress, completed, learnerActivity = [] }) {
    const { auth } = usePage().props;
    const t = useT();

    return (
        <AuthenticatedLayout>
            <Head title={t('dashboard.title')} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                <WelcomeHero user={auth?.user} inProgress={inProgress} completed={completed} />

                <ContinueLearning inProgress={inProgress} />

                <section className="mb-10">
                    <h2 className="mb-4 text-xl font-semibold">{t('dashboard.section.in_progress')}</h2>
                    {inProgress.length === 0 ? (
                        <EmptyState
                            message={t('dashboard.empty.not_started')}
                            actionLabel={t('dashboard.empty.browse_catalog')}
                            actionHref="/courses"
                        />
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {inProgress.map((enrollment) => (
                                <CourseCard key={enrollment.id} enrollment={enrollment} />
                            ))}
                        </div>
                    )}
                </section>

                {completed.length > 0 && (
                    <>
                        <Separator className="mb-10" />
                        <section>
                            <h2 className="mb-4 text-xl font-semibold">{t('dashboard.section.completed')}</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {completed.map((enrollment) => (
                                    <CourseCard key={enrollment.id} enrollment={enrollment} completed />
                                ))}
                            </div>
                        </section>
                    </>
                )}

                <Separator className="my-10" />

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{t('dashboard.activity.title')}</h2>
                        <span className="text-xs text-muted-foreground">{t('dashboard.activity.events', { n: learnerActivity.length })}</span>
                    </div>

                    {learnerActivity.length === 0 ? (
                        <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                            {t('dashboard.activity.empty')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead className="bg-muted/40 text-left">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">{t('dashboard.activity.col_course')}</th>
                                        <th className="px-3 py-2 font-medium">{t('dashboard.activity.col_event')}</th>
                                        <th className="px-3 py-2 font-medium">{t('dashboard.activity.col_lesson')}</th>
                                        <th className="px-3 py-2 font-medium">{t('dashboard.activity.col_result')}</th>
                                        <th className="px-3 py-2 font-medium">{t('dashboard.activity.col_time')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {learnerActivity.map((item) => (
                                        <tr key={item.id} className="border-t align-top">
                                            <td className="px-3 py-2 font-medium">{item.course_title ?? '-'}</td>
                                            <td className="px-3 py-2">{t('courses.show.event.' + item.event)}</td>
                                            <td className="px-3 py-2 text-muted-foreground">{item.properties?.lesson_title ?? '-'}</td>
                                            <td className="px-3 py-2">{renderActivityResult(item)}</td>
                                            <td className="px-3 py-2 text-muted-foreground">{item.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
