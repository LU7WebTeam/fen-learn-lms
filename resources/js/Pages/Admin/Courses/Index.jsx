import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useState } from 'react';

const STATUS_VARIANTS = {
    draft:     'secondary',
    review:    'outline',
    published: 'default',
};

const DIFFICULTY_LABELS = {
    beginner:     'Beginner',
    intermediate: 'Intermediate',
    advanced:     'Advanced',
};

function StatusBadge({ status }) {
    return (
        <Badge variant={STATUS_VARIANTS[status] || 'secondary'} className="capitalize">
            {status}
        </Badge>
    );
}

function CourseRow({ course }) {
    const [deleting, setDeleting] = useState(false);

    function handleDelete() {
        if (!window.confirm(`Delete "${course.title}"? This will remove all sections, lessons and enrollments.`)) return;
        setDeleting(true);
        router.delete(route('admin.courses.destroy', course.id));
    }

    return (
        <TableRow>
            <TableCell className="font-medium max-w-xs">
                <Link
                    href={route('admin.courses.edit', course.id)}
                    className="hover:underline hover:text-primary"
                >
                    <div className="truncate">{course.title}</div>
                </Link>
                <div className="text-xs text-muted-foreground truncate">{course.slug}</div>
            </TableCell>
            <TableCell><StatusBadge status={course.status} /></TableCell>
            <TableCell className="text-sm">{DIFFICULTY_LABELS[course.difficulty]}</TableCell>
            <TableCell className="text-sm text-center">{course.lessons_count}</TableCell>
            <TableCell className="text-sm text-center">{course.enrollments_count}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{course.creator?.name ?? '—'}</TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={route('admin.courses.edit', course.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit / Build
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            disabled={deleting}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

export default function CoursesIndex({ courses }) {
    return (
        <AdminLayout title="Courses">
            <Head title="Courses — Admin" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Courses</h2>
                        <p className="text-muted-foreground">Manage all courses on the platform.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.courses.create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Course
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {courses.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="mb-4 text-muted-foreground">No courses yet.</p>
                                <Button asChild>
                                    <Link href={route('admin.courses.create')}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create the first course
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Difficulty</TableHead>
                                        <TableHead className="text-center">Lessons</TableHead>
                                        <TableHead className="text-center">Enrolled</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.data.map((course) => (
                                        <CourseRow key={course.id} course={course} />
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {courses.last_page > 1 && (
                    <div className="flex justify-center gap-2">
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
        </AdminLayout>
    );
}
