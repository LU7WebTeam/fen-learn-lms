import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Progress } from '@/Components/ui/progress';
import { BookOpen, Play, GraduationCap, Clock } from 'lucide-react';
import { tl } from '@/lib/locale';
import { useT } from '@/lib/i18n';
import LangSwitcher from '@/Components/LangSwitcher';

const DIFFICULTY_COLORS = {
    beginner:     'secondary',
    intermediate: 'default',
    advanced:     'destructive',
};

function CourseCard({ course, enrolled }) {
    const { locale } = usePage().props;
    const title       = tl(course, 'title', locale);
    const description = tl(course, 'description', locale);
    const t = useT();

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="flex flex-col sm:flex-row">
                {course.cover_image ? (
                    <img src={course.cover_image} alt={title} className="h-52 w-full object-cover sm:h-auto sm:w-64 sm:shrink-0" />
                ) : (
                    <div className="flex h-52 w-full items-center justify-center bg-muted sm:h-auto sm:w-64 sm:shrink-0">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                    <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                            <CardTitle className="line-clamp-2 text-lg leading-snug">{title}</CardTitle>
                            <Badge variant={DIFFICULTY_COLORS[course.difficulty] || 'secondary'} className="shrink-0 capitalize">
                                {course.difficulty}
                            </Badge>
                        </div>
                        {course.category && <CardDescription>{course.category}</CardDescription>}
                    </CardHeader>

                    <CardContent className="flex-1 pb-2">
                        <p className="line-clamp-3 text-sm text-muted-foreground">{description}</p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5" />
                                {course.lessons_count} lessons
                            </span>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                        <Button asChild className="w-full sm:w-auto" variant={enrolled ? 'outline' : 'default'}>
                            <Link href={route('courses.show', course.slug)}>
                                {enrolled
                                    ? <><Play className="mr-2 h-4 w-4" />{t('courses.index.continue')}</>
                                    : t('courses.index.view_course')}
                            </Link>
                        </Button>
                    </CardFooter>
                </div>
            </div>
        </Card>
    );
}

function Filters({ categories, filters }) {
    function update(key, value) {
        router.get(route('courses.index'), { ...filters, [key]: (value === 'all' ? undefined : value) || undefined }, { preserveState: true, replace: true });
    }

    function reset() {
        router.get(route('courses.index'), {}, { preserveState: false });
    }

    const hasFilters = filters.category || filters.difficulty;
    const t = useT();

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Select value={filters.difficulty || 'all'} onValueChange={(v) => update('difficulty', v)}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('courses.index.filter_difficulty')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('courses.index.filter_difficulty')}</SelectItem>
                    <SelectItem value="beginner">{t('courses.index.filter_beginner')}</SelectItem>
                    <SelectItem value="intermediate">{t('courses.index.filter_intermediate')}</SelectItem>
                    <SelectItem value="advanced">{t('courses.index.filter_advanced')}</SelectItem>
                </SelectContent>
            </Select>

            {categories.length > 0 && (
                <Select value={filters.category || 'all'} onValueChange={(v) => update('category', v)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder={t('courses.index.filter_category')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('courses.index.filter_category')}</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
                    {t('courses.index.clear_filters')}
                </Button>
            )}
        </div>
    );
}

export default function CoursesIndex({ courses, enrolledIds, categories, filters }) {
    const { auth } = usePage().props;
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;
    const t = useT();

    return (
        <Layout fullWidth={!auth?.user}>
            <Head title={t('courses.index.title')} />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('courses.index.title')}</h1>
                        <p className="mt-1 text-muted-foreground">
                            {t(courses.total !== 1 ? 'courses.index.available_other' : 'courses.index.available_one', { n: courses.total })}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {!auth?.user && <LangSwitcher />}
                        <Filters categories={categories} filters={filters} />
                    </div>
                </div>

                {courses.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">{t('courses.index.no_courses')}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {courses.data.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                enrolled={enrolledIds.includes(course.id)}
                            />
                        ))}
                    </div>
                )}

                {courses.last_page > 1 && (
                    <div className="mt-10 flex justify-center gap-2">
                        {courses.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
