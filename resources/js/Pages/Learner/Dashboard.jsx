import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { BookOpen, Play, Award, GraduationCap } from 'lucide-react';

const difficultyColors = {
    beginner:     'secondary',
    intermediate: 'default',
    advanced:     'destructive',
};

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
    return (
        <AuthenticatedLayout>
            <Head title="My Learning" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
                    <p className="mt-1 text-muted-foreground">
                        Pick up where you left off or explore completed courses.
                    </p>
                </div>

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
