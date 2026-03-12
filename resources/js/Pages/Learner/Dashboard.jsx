import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { BookOpen, Play, Award, GraduationCap, Sun, Sunset, Moon, TrendingUp, CheckCircle2, Library } from 'lucide-react';

const difficultyColors = {
    beginner:     'secondary',
    intermediate: 'default',
    advanced:     'destructive',
};

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return { text: 'Good morning', Icon: Sun,     color: 'text-yellow-500' };
    if (h < 18) return { text: 'Good afternoon', Icon: Sunset, color: 'text-orange-500' };
    return             { text: 'Good evening',   Icon: Moon,   color: 'text-indigo-400' };
}

function WelcomeHero({ user, inProgress, completed }) {
    const { text, Icon, color } = getGreeting();
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
                                {text}, {firstName}!
                            </h1>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {activeCount > 0
                                ? `You have ${activeCount} course${activeCount !== 1 ? 's' : ''} in progress. Keep it up!`
                                : totalEnrolled === 0
                                    ? "You haven't enrolled in any courses yet. Start learning today!"
                                    : "All caught up! Browse the catalog to find something new."}
                        </p>
                    </div>

                    {/* Shortcuts */}
                    <div className="flex flex-wrap gap-2 sm:shrink-0">
                        <Button asChild size="sm" variant="outline">
                            <Link href="/courses">
                                <Library className="mr-2 h-4 w-4" />
                                Browse Catalog
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stat chips */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                    <div className="rounded-lg border bg-background/80 px-4 py-3 text-center">
                        <GraduationCap className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                        <div className="text-xl font-bold">{totalEnrolled}</div>
                        <div className="text-xs text-muted-foreground">Enrolled</div>
                    </div>
                    <div className="rounded-lg border bg-background/80 px-4 py-3 text-center">
                        <TrendingUp className="mx-auto mb-1 h-5 w-5 text-primary" />
                        <div className="text-xl font-bold">{inProgress.length}</div>
                        <div className="text-xs text-muted-foreground">In Progress</div>
                    </div>
                    <div className="rounded-lg border bg-background/80 px-4 py-3 text-center">
                        <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-green-500" />
                        <div className="text-xl font-bold">{completed.length}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ContinueLearning({ inProgress }) {
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Continue where you left off</p>
                        <h3 className="text-lg font-semibold leading-snug">{course.title}</h3>
                        {course.category && <p className="text-sm text-muted-foreground mt-0.5">{course.category}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                    <div>
                        <Button asChild size="sm">
                            <Link href={resumeHref}>
                                <Play className="mr-2 h-3.5 w-3.5" />
                                Resume
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
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}
                {completed && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <Award className="h-4 w-4" />
                        <span className="font-medium">Completed!</span>
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
                            {progress > 0 ? 'Resume' : 'Start'}
                        </Link>
                    </Button>
                )}
                {completed && certificate_uuid && (
                    <Button asChild variant="outline" size="sm" className="flex-1 border-[#8B1A4A] text-[#8B1A4A] hover:bg-[#8B1A4A] hover:text-white">
                        <Link href={`/certificate/${certificate_uuid}`}>
                            <Award className="mr-1 h-3.5 w-3.5" />
                            View Certificate
                        </Link>
                    </Button>
                )}
                {completed && (
                    <Button asChild variant="ghost" size="sm" className="flex-1">
                        <Link href={`/learn/${course.slug}`}>
                            Review
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

export default function Dashboard({ inProgress, completed }) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="My Learning" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                <WelcomeHero user={auth?.user} inProgress={inProgress} completed={completed} />

                <ContinueLearning inProgress={inProgress} />

                <section className="mb-10">
                    <h2 className="mb-4 text-xl font-semibold">In Progress</h2>
                    {inProgress.length === 0 ? (
                        <EmptyState
                            message="You haven't started any courses yet."
                            actionLabel="Browse the Catalog"
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
                            <h2 className="mb-4 text-xl font-semibold">Completed</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {completed.map((enrollment) => (
                                    <CourseCard key={enrollment.id} enrollment={enrollment} completed />
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
