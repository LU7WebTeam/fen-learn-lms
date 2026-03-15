import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { tl } from '@/lib/locale';
import { useT } from '@/lib/i18n';
import LangSwitcher from '@/Components/LangSwitcher';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/Components/ui/accordion';
import { Separator } from '@/Components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { BookOpen, Play, Award, Clock, ChevronRight, Video, FileText, HelpCircle, Check, Lock } from 'lucide-react';
import BlockNoteRenderer from '@/Components/BlockNoteRenderer';

const DIFFICULTY_COLORS = { beginner: 'secondary', intermediate: 'default', advanced: 'destructive' };

const LESSON_ICONS = { video: Video, text: FileText, quiz: HelpCircle };

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

function LessonRow({ lesson, completed, courseSlug, enrolled }) {
    const { locale } = usePage().props;
    const t = useT();
    const Icon = LESSON_ICONS[lesson.type] ?? FileText;
    const canOpen = enrolled || lesson.is_free_preview;

    return (
        <div className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${canOpen ? 'hover:bg-muted' : ''}`}>
            {completed
                ? <Check className="h-4 w-4 shrink-0 text-green-500" />
                : canOpen
                    ? <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    : <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />}
            <span className={`flex-1 ${!canOpen ? 'text-muted-foreground' : ''}`}>{tl(lesson, 'title', locale)}</span>
            {lesson.is_free_preview && !enrolled && (
                <Badge variant="outline" className="text-xs">{t('courses.show.preview_badge')}</Badge>
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

export default function CourseShow({ course, totalLessons, enrollment, completedIds, firstLessonId, learnerActivity = [] }) {
    const { auth, locale } = usePage().props;
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
    const t = useT();

    const courseTitle       = tl(course, 'title', locale);
    const courseDescription = tl(course, 'description', locale);
    const courseIntro       = tl(course, 'introduction', locale);

    function handleEnroll() {
        router.post(route('courses.enroll', course.slug));
    }

    const enrolled = !!enrollment;

    const metaTitle = course.meta_title || courseTitle;
    const metaDesc  = course.meta_description || (typeof courseDescription === 'string' ? courseDescription : '');
    const metaImage = course.meta_image || course.cover_image || '';

    return (
        <Layout fullWidth={!auth?.user}>
            <Head title={metaTitle}>
                <meta name="description" content={metaDesc} />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDesc} />
                {metaImage && <meta property="og:image" content={metaImage} />}
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={metaDesc} />
                {metaImage && <meta name="twitter:image" content={metaImage} />}
            </Head>

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                {!auth?.user && (
                    <div className="mb-4 flex justify-end">
                        <LangSwitcher />
                    </div>
                )}

                {/* Hero */}
                <div className="mb-8 grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={DIFFICULTY_COLORS[course.difficulty] || 'secondary'} className="capitalize">
                                {course.difficulty}
                            </Badge>
                            {course.category && <Badge variant="outline">{course.category}</Badge>}
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight leading-tight">{courseTitle}</h1>

                        {courseDescription && (
                            <p className="text-muted-foreground leading-relaxed">{courseDescription}</p>
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
                                        {enrollment.progress > 0 ? t('courses.show.resume_course') : t('courses.show.start_course')}
                                    </Link>
                                </Button>
                            ) : auth?.user ? (
                                <Button className="w-full" size="lg" onClick={handleEnroll}>
                                    {t('courses.show.enroll_free')}
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <Button asChild className="w-full" size="lg">
                                        <Link href={route('register')}>{t('courses.show.sign_up_enroll')}</Link>
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        {t('courses.show.already_account')}{' '}
                                        <Link href={route('login')} className="underline">{t('courses.show.log_in')}</Link>
                                    </p>
                                </div>
                            )}

                            {enrollment?.completed_at && (
                                <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">
                                    <Award className="h-4 w-4" />
                                    {t('courses.show.completed')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {enrolled ? (
                    <Tabs defaultValue="main" className="w-full">
                        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="main">{t('courses.show.tab_main')}</TabsTrigger>
                            <TabsTrigger value="activity">{t('courses.show.tab_activity')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="main" className="space-y-8">
                            {/* Introduction (BlockNote rich content) */}
                            {Array.isArray(courseIntro) && courseIntro.length > 0 && (
                                <div>
                                    <h2 className="mb-4 text-xl font-semibold">{t('courses.show.about_course')}</h2>
                                    <BlockNoteRenderer content={courseIntro} />
                                </div>
                            )}

                            {/* Curriculum */}
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">{t('courses.show.curriculum')}</h2>
                                {course.sections.length === 0 ? (
                                    <p className="text-muted-foreground">{t('courses.show.no_lessons')}</p>
                                ) : (
                                    <Accordion type="multiple" defaultValue={course.sections.map((s) => String(s.id))}>
                                        {course.sections.map((section) => (
                                            <AccordionItem key={section.id} value={String(section.id)}>
                                                <AccordionTrigger className="text-base font-medium">
                                                    <span className="flex items-center gap-2">
                                                        {tl(section, 'title', locale)}
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
                        </TabsContent>

                        <TabsContent value="activity">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">{t('courses.show.activity_title')}</h2>
                                <span className="text-xs text-muted-foreground">{t('courses.show.activity_events', { n: learnerActivity.length })}</span>
                            </div>

                            {learnerActivity.length === 0 ? (
                                <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                    {t('courses.show.activity_empty')}
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full min-w-[760px] text-sm">
                                        <thead className="bg-muted/40 text-left">
                                            <tr>
                                                <th className="px-3 py-2 font-medium">{t('courses.show.activity_col_event')}</th>
                                                <th className="px-3 py-2 font-medium">{t('courses.show.activity_col_lesson')}</th>
                                                <th className="px-3 py-2 font-medium">{t('courses.show.activity_col_result')}</th>
                                                <th className="px-3 py-2 font-medium">{t('courses.show.activity_col_time')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {learnerActivity.map((item) => (
                                                <tr key={item.id} className="border-t align-top">
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
                        </TabsContent>
                    </Tabs>
                ) : (
                    <>
                        {/* Introduction (BlockNote rich content) */}
                        {Array.isArray(courseIntro) && courseIntro.length > 0 && (
                            <>
                                <Separator className="my-8" />
                                <div>
                                    <h2 className="mb-4 text-xl font-semibold">{t('courses.show.about_course')}</h2>
                                    <BlockNoteRenderer content={courseIntro} />
                                </div>
                            </>
                        )}

                        <Separator className="my-8" />

                        {/* Curriculum */}
                        <div>
                            <h2 className="mb-4 text-xl font-semibold">{t('courses.show.curriculum')}</h2>
                            {course.sections.length === 0 ? (
                                <p className="text-muted-foreground">{t('courses.show.no_lessons')}</p>
                            ) : (
                                <Accordion type="multiple" defaultValue={course.sections.map((s) => String(s.id))}>
                                    {course.sections.map((section) => (
                                        <AccordionItem key={section.id} value={String(section.id)}>
                                            <AccordionTrigger className="text-base font-medium">
                                                <span className="flex items-center gap-2">
                                                    {tl(section, 'title', locale)}
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
                    </>
                )}
            </div>
        </Layout>
    );
}
