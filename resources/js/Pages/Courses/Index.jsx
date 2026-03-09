import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Progress } from '@/Components/ui/progress';
import { BookOpen, Play, GraduationCap, Clock } from 'lucide-react';

const DIFFICULTY_COLORS = {
    beginner:     'secondary',
    intermediate: 'default',
    advanced:     'destructive',
};

function CourseCard({ course, enrolled }) {
    return (
        <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
            {course.cover_image ? (
                <img src={course.cover_image} alt={course.title} className="h-44 w-full object-cover" />
            ) : (
                <div className="flex h-44 w-full items-center justify-center bg-muted">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
            )}
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2 text-base leading-snug">{course.title}</CardTitle>
                    <Badge variant={DIFFICULTY_COLORS[course.difficulty] || 'secondary'} className="shrink-0 capitalize">
                        {course.difficulty}
                    </Badge>
                </div>
                {course.category && <CardDescription>{course.category}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course.lessons_count} lessons
                    </span>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full" variant={enrolled ? 'outline' : 'default'}>
                    <Link href={route('courses.show', course.slug)}>
                        {enrolled
                            ? <><Play className="mr-2 h-4 w-4" />Continue</>
                            : 'View Course'}
                    </Link>
                </Button>
            </CardFooter>
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

    return (
        <div className="flex flex-wrap items-center gap-3">
            <Select value={filters.difficulty || 'all'} onValueChange={(v) => update('difficulty', v)}>
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
            </Select>

            {categories.length > 0 && (
                <Select value={filters.category || 'all'} onValueChange={(v) => update('category', v)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
                    Clear filters
                </Button>
            )}
        </div>
    );
}

export default function CoursesIndex({ courses, enrolledIds, categories, filters }) {
    const { auth } = usePage().props;
    const Layout = auth?.user ? AuthenticatedLayout : GuestLayout;

    return (
        <Layout>
            <Head title="Course Catalog" />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Course Catalog</h1>
                        <p className="mt-1 text-muted-foreground">
                            {courses.total} course{courses.total !== 1 ? 's' : ''} available
                        </p>
                    </div>
                    <Filters categories={categories} filters={filters} />
                </div>

                {courses.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No published courses yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
