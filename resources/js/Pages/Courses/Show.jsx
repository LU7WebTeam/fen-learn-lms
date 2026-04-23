import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { tl, useT } from '@/lib/i18n';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/Components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { BookOpen, Play, Award, ChevronRight, Video, FileText, HelpCircle, Check, Lock } from 'lucide-react';
import { lazy, Suspense } from 'react';
const BlockNoteRenderer = lazy(() => import('@/Components/BlockNoteRenderer'));

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
    const t = useT();
    const hasScore = item.properties?.percentage !== null && item.properties?.percentage !== undefined;
    const hasPassed = typeof item.properties?.passed === 'boolean';

    if (!hasScore && !hasPassed) {
        return '-';
    }

    if (hasScore && hasPassed) {
        return `${item.properties.percentage}% (${item.properties.passed ? t('courses.show.passed') : t('courses.show.failed')})`;
    }

    if (hasScore) {
        return `${item.properties.percentage}%`;
    }

    return item.properties.passed ? t('courses.show.passed') : t('courses.show.failed');
}

function LessonRow({ lesson, completed, courseSlug, enrolled, completedIds }) {
    const { locale } = usePage().props;
    const t = useT();
    const Icon = LESSON_ICONS[lesson.type] ?? FileText;
    const blockedByPrerequisite = enrolled
        && !!lesson.prerequisite_lesson_id
        && !completedIds.includes(lesson.prerequisite_lesson_id);
    const canOpen = !blockedByPrerequisite && (enrolled || lesson.is_free_preview);
    const tooltipText = !canOpen
        ? enrolled && blockedByPrerequisite
            ? t('courses.show.locked_prerequisite_tooltip')
            : t('courses.show.locked_enroll_tooltip')
        : null;

    const row = (
        <div className={`flex items-center gap-3 rounded-md px-3 py-2 text-base transition-colors ${canOpen ? 'hover:bg-[#f4f6fa] dark:hover:bg-[#1f2937]' : 'cursor-help'}`}>
            {completed
                ? <Check className="h-4 w-4 shrink-0 text-green-500" />
                : canOpen
                        ? <Icon className="h-4 w-4 shrink-0 text-[#9ca3af] dark:text-slate-400" />
                        : <Lock className="h-4 w-4 shrink-0 text-[#c0c7d4] dark:text-slate-500" />}
                    <span className={`flex-1 ${!canOpen ? 'text-[#9ca3af] dark:text-slate-500' : 'text-[#131722] dark:text-slate-100'}`}>{tl(lesson, 'title', locale)}</span>
            {lesson.is_free_preview && !enrolled && (
                <Badge variant="outline" className="text-xs border-[#b53391] text-[#b53391]">{t('courses.show.preview_badge')}</Badge>
            )}
            {lesson.duration_minutes > 0 && (
                <span className="text-xs text-[#9ca3af] dark:text-slate-400">{lesson.duration_minutes}min</span>
            )}
            {canOpen && enrolled && (
                <Link href={route('learn.lesson', [courseSlug, lesson.id])}>
                    <ChevronRight className="h-4 w-4 text-[#9ca3af] dark:text-slate-400" />
                </Link>
            )}
        </div>
    );

    if (!tooltipText) {
        return row;
    }

    return (
        <TooltipProvider delayDuration={120}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {row}
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default function CourseShow({ course, totalLessons, enrollment, completedIds, firstLessonId, learnerActivity = [] }) {
    const { auth, locale } = usePage().props;
    const Layout = auth?.user ? AuthenticatedLayout : PublicLayout;
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
        <Layout>
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

            <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
                {/* Hero grid */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Course info card */}
                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 lg:col-span-2 space-y-4 dark:bg-[#111827] dark:ring-white/10">
                        <div className="flex items-start gap-3">
                            <h1 className="font-['Inter',sans-serif] text-3xl font-extrabold leading-tight text-[#131722] dark:text-slate-100">{courseTitle}</h1>
                            {enrollment?.completed_at && (
                                <Badge className="mt-1.5 shrink-0 bg-green-500 text-white hover:bg-green-500">{t('courses.show.completed_badge')}</Badge>
                            )}
                        </div>
                        {courseDescription && (
                            <p className="leading-relaxed text-[#545c6b] dark:text-slate-300">{courseDescription}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-[#9ca3af] dark:text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <BookOpen className="h-4 w-4" />
                                {totalLessons} {totalLessons === 1 ? t('common.lesson') : t('common.lessons')}
                            </span>
                        </div>
                        {enrolled && (
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#545c6b] dark:text-slate-300">{t('courses.show.your_progress')}</span>
                                    <span className="font-semibold text-[#131722] dark:text-slate-100">{enrollment.progress}%</span>
                                </div>
                                <Progress value={enrollment.progress} className="h-2" />
                            </div>
                        )}
                    </div>

                    {/* Enroll card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 space-y-4 dark:bg-[#111827] dark:ring-white/10">
                            {course.cover_image ? (
                                <img src={course.cover_image} alt={courseTitle} className="w-full rounded-lg object-contain" />
                            ) : (
                                <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-[#f4f6fa] dark:bg-[#1f2937]">
                                    <BookOpen className="h-10 w-10 text-[#9ca3af] dark:text-slate-400" />
                                </div>
                            )}

                            {enrolled ? (
                                enrollment.completed_at ? (
                                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                                        <Link href={route('certificate.show', enrollment.certificate_uuid)}>
                                            <Award className="mr-2 h-4 w-4" />
                                            {t('courses.show.get_certificate')}
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button asChild className="w-full bg-[#b53391] hover:bg-[#9f2c80] text-white" size="lg">
                                        <Link href={route('learn.lesson', [course.slug, enrollment.last_lesson_id || firstLessonId])}>
                                            <Play className="mr-2 h-4 w-4" />
                                            {enrollment.progress > 0 ? t('courses.show.resume_course') : t('courses.show.start_course')}
                                        </Link>
                                    </Button>
                                )
                            ) : auth?.user ? (
                                <Button className="w-full bg-[#b53391] hover:bg-[#9f2c80] text-white" size="lg" onClick={handleEnroll}>
                                    {t('courses.show.enroll_free')}
                                </Button>
                            ) : (
                                <div className="space-y-2">
                                    <Button asChild className="w-full bg-[#b53391] hover:bg-[#9f2c80] text-white" size="lg">
                                        <Link href={route('register')}>{t('courses.show.sign_up_enroll')}</Link>
                                    </Button>
                                    <p className="text-center text-xs text-[#9ca3af] dark:text-slate-400">
                                        {t('courses.show.already_account')}{' '}
                                        <Link href={route('login')} className="text-[#b53391] underline">{t('courses.show.log_in')}</Link>
                                    </p>
                                </div>
                            )}

                            {enrollment?.completed_at && (
                                <div className="flex items-center justify-center gap-2 text-sm font-medium text-green-600">
                                    <Award className="h-4 w-4" />
                                    {t('courses.show.completed')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {enrolled ? (
                    <Tabs defaultValue="main" className="w-full">
                        <TabsList className="mb-2 grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="main">{t('courses.show.tab_main')}</TabsTrigger>
                            <TabsTrigger value="activity">{t('courses.show.tab_activity')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="main" className="space-y-4">
                            {Array.isArray(courseIntro) && courseIntro.length > 0 && (
                                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-[#111827] dark:ring-white/10">
                                    <h2 className="mb-4 font-['Inter',sans-serif] text-2xl font-extrabold text-[#131722] dark:text-slate-100">{t('courses.show.about_course')}</h2>
                                    <Suspense fallback={<div className="h-20 animate-pulse rounded bg-[#f4f6fa] dark:bg-[#1f2937]" />}>
                                        <BlockNoteRenderer content={courseIntro} />
                                    </Suspense>
                                </div>
                            )}

                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-[#111827] dark:ring-white/10">
                                <h2 className="mb-4 font-['Inter',sans-serif] text-2xl font-extrabold text-[#131722] dark:text-slate-100">{t('courses.show.curriculum')}</h2>
                                {course.sections.length === 0 ? (
                                    <p className="text-[#9ca3af] dark:text-slate-400">{t('courses.show.no_lessons')}</p>
                                ) : (
                                    <Accordion type="multiple" defaultValue={course.sections.map((s) => String(s.id))}>
                                        {course.sections.map((section) => (
                                            <AccordionItem key={section.id} value={String(section.id)}>
                                                <AccordionTrigger className="text-base font-extrabold text-[#131722] hover:no-underline dark:text-slate-100">
                                                    <span className="flex items-center gap-2">
                                                        {tl(section, 'title', locale)}
                                                        <span className="text-xs font-normal text-[#9ca3af] dark:text-slate-400">
                                                            {section.lessons.length} {section.lessons.length === 1 ? t('common.lesson') : t('common.lessons')}
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
                                                                completedIds={completedIds}
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
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-[#111827] dark:ring-white/10">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-['Inter',sans-serif] text-2xl font-extrabold text-[#131722] dark:text-slate-100">{t('courses.show.activity_title')}</h2>
                                    <span className="text-xs text-[#9ca3af] dark:text-slate-400">{t('courses.show.activity_events', { n: learnerActivity.length })}</span>
                                </div>

                                {learnerActivity.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-[#d9dee8] px-4 py-10 text-center text-[#9ca3af] dark:border-[#334155] dark:text-slate-400">
                                        {t('courses.show.activity_empty')}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-[#d9dee8] dark:border-[#334155]">
                                        <table className="w-full min-w-[760px] text-base">
                                            <thead className="bg-[#f4f6fa] text-left dark:bg-[#1f2937]">
                                                <tr>
                                                    <th className="px-3 py-2 font-semibold text-[#131722] dark:text-slate-100">{t('courses.show.activity_col_event')}</th>
                                                    <th className="px-3 py-2 font-semibold text-[#131722] dark:text-slate-100">{t('courses.show.activity_col_lesson')}</th>
                                                    <th className="px-3 py-2 font-semibold text-[#131722] dark:text-slate-100">{t('courses.show.activity_col_result')}</th>
                                                    <th className="px-3 py-2 font-semibold text-[#131722] dark:text-slate-100">{t('courses.show.activity_col_time')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {learnerActivity.map((item) => (
                                                    <tr key={item.id} className="border-t border-[#d9dee8] align-top dark:border-[#334155]">
                                                        <td className="px-3 py-2 text-[#131722] dark:text-slate-100">{t('courses.show.event.' + item.event)}</td>
                                                        <td className="px-3 py-2 text-[#545c6b] dark:text-slate-300">
                                                            {item.properties?.lesson
                                                                ? tl(item.properties.lesson, 'title', locale)
                                                                : locale === 'ms'
                                                                    ? (item.properties?.lesson_title_ms || item.properties?.lesson_title || '-')
                                                                    : (item.properties?.lesson_title || '-')}
                                                        </td>
                                                        <td className="px-3 py-2 text-[#131722] dark:text-slate-100">{renderActivityResult(item)}</td>
                                                        <td className="px-3 py-2 text-[#545c6b] dark:text-slate-300">{item.created_at}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <>
                        {Array.isArray(courseIntro) && courseIntro.length > 0 && (
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-[#111827] dark:ring-white/10">
                                <h2 className="mb-4 font-['Inter',sans-serif] text-2xl font-extrabold text-[#131722] dark:text-slate-100">{t('courses.show.about_course')}</h2>
                                <Suspense fallback={<div className="h-20 animate-pulse rounded bg-[#f4f6fa] dark:bg-[#1f2937]" />}>
                                    <BlockNoteRenderer content={courseIntro} />
                                </Suspense>
                            </div>
                        )}

                        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 dark:bg-[#111827] dark:ring-white/10">
                            <h2 className="mb-4 font-['Inter',sans-serif] text-2xl font-extrabold text-[#131722] dark:text-slate-100">{t('courses.show.curriculum')}</h2>
                            {course.sections.length === 0 ? (
                                <p className="text-[#9ca3af] dark:text-slate-400">{t('courses.show.no_lessons')}</p>
                            ) : (
                                <Accordion type="multiple" defaultValue={course.sections.map((s) => String(s.id))}>
                                    {course.sections.map((section) => (
                                        <AccordionItem key={section.id} value={String(section.id)}>
                                            <AccordionTrigger className="text-base font-extrabold text-[#131722] hover:no-underline dark:text-slate-100">
                                                <span className="flex items-center gap-2">
                                                    {tl(section, 'title', locale)}
                                                    <span className="text-xs font-normal text-[#9ca3af] dark:text-slate-400">
                                                        {section.lessons.length} {section.lessons.length === 1 ? t('common.lesson') : t('common.lessons')}
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
                                                            completedIds={completedIds}
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
