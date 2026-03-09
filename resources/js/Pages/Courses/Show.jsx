import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/Components/ui/accordion';
import { Separator } from '@/Components/ui/separator';
import { BookOpen, Play, Award, Clock, ChevronRight, Video, FileText, HelpCircle, Check, Lock } from 'lucide-react';
import BlockNoteRenderer from '@/Components/BlockNoteRenderer';

const DIFFICULTY_COLORS = { beginner: 'secondary', intermediate: 'default', advanced: 'destructive' };

const LESSON_ICONS = { video: Video, text: FileText, quiz: HelpCircle };

function LessonRow({ lesson, completed, courseSlug, enrolled }) {
    const Icon = LESSON_ICONS[lesson.type] ?? FileText;
    const canOpen = enrolled || lesson.is_free_preview;

    return (
        <div className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${canOpen ? 'hover:bg-muted' : ''}`}>
            {completed
                ? <Check className="h-4 w-4 shrink-0 text-green-500" />
                : canOpen
                    ? <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    : <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <span className={`flex-1 ${!canOpen ? 'text-muted-foreground' : ''}`}>{lesson.title}</span>
            {lesson.is_free_preview && !enrolled && (
                <Badge variant="outline" className="text-xs">Preview</Badge>
            )}
            {lesson.duration_minutes > 0 && (
                <span className="text-xs text-muted-foreground">{lesson.duration_minutes}min</span>
            )}
            {canOpen && enrolled && (
                <Link href={route('learn.lesson', [courseSlug, lesson.id])}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
            )}
        </div>
    );
}

export default function CourseShow({ course, totalLessons, enrollment, completedIds, firstLessonId }) {
    const { auth } = usePage().props;
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    function handleEnroll() {
        router.post(route('courses.enroll', course.slug));
    }

    const enrolled = !!enrollment;

    return (
        <Layout>
            <Head title={course.title} />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Hero */}
                <div className="mb-8 grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={DIFFICULTY_COLORS[course.difficulty] || 'secondary'} className="capitalize">
                                {course.difficulty}
                            </Badge>
                            {course.category && <Badge variant="outline">{course.category}</Badge>}
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight leading-tight">{course.title}</h1>

                        {course.description && (
                            <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4" />
                                {totalLessons} lessons
                            </span>
                            {course.creator && (
                                <span>By {course.creator.name}</span>
                            )}
                        </div>

                        {enrolled && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Your progress</span>
                                    <span className="font-medium">{enrollment.progress}%</span>
                                </div>
                                <Progress value={enrollment.progress} className="h-2" />
                            </div>
                        )}
                    </div>

                    {/* Enroll Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6 rounded-xl border bg-card p-5 shadow-sm space-y-4">
                            {course.cover_image ? (
                                <img src={course.cover_image} alt={course.title} className="w-full rounded-lg object-cover aspect-video" />
                            ) : (
                                <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                                    <BookOpen className="h-10 w-10 text-muted-foreground" />
                                </div>
                            )}

                            {enrolled ? (
                                <Button asChild className="w-full" size="lg">
                                    <Link href={route('learn.lesson', [course.slug, enrollment.last_lesson_id || firstLessonId])}>
                                        <Play className="mr-2 h-4 w-4" />
                                        {enrollment.progress > 0 ? 'Resume Course' : 'Start Course'}
                                    </Link>
                                </Button>
                            ) : auth?.user ? (
                                <Button className="w-full" size="lg" onClick={handleEnroll}>
                                    Enroll — Free
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <Button asChild className="w-full" size="lg">
                                        <Link href={route('register')}>Sign Up & Enroll Free</Link>
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        Already have an account?{' '}
                                        <Link href={route('login')} className="underline">Log in</Link>
                                    </p>
                                </div>
                            )}

                            {enrollment?.completed_at && (
                                <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                                    <Award className="h-4 w-4" />
                                    Completed!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Introduction (BlockNote rich content) */}
                {Array.isArray(course.introduction) && course.introduction.length > 0 && (
                    <>
                        <Separator className="my-8" />
                        <div>
                            <h2 className="mb-4 text-xl font-semibold">About This Course</h2>
                            <BlockNoteRenderer content={course.introduction} />
                        </div>
                    </>
                )}

                <Separator className="my-8" />

                {/* Curriculum */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Course Curriculum</h2>
                    {course.sections.length === 0 ? (
                        <p className="text-muted-foreground">No lessons added yet.</p>
                    ) : (
                        <Accordion type="multiple" defaultValue={course.sections.map((s) => String(s.id))}>
                            {course.sections.map((section) => (
                                <AccordionItem key={section.id} value={String(section.id)}>
                                    <AccordionTrigger className="text-base font-medium">
                                        <span className="flex items-center gap-2">
                                            {section.title}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
                                            </span>
                                        </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-0.5">
                                            {section.lessons.map((lesson) => (
                                                <LessonRow
                                                    key={lesson.id}
                                                    lesson={lesson}
                                                    completed={completedIds.includes(lesson.id)}
                                                    courseSlug={course.slug}
                                                    enrolled={enrolled}
                                                />
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </div>
        </Layout>
    );
}
