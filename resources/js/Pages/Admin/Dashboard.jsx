import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Users, BookOpen, TrendingUp, Award } from 'lucide-react';

const statusVariants = {
    draft:     'secondary',
    review:    'default',
    published: 'success',
};

function StatCard({ title, value, description, icon: Icon, trend }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value}</div>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard({ stats, recentCourses }) {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard" />

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                    <p className="text-muted-foreground">Platform metrics at a glance.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Learners"
                        value={stats.totalUsers.toLocaleString()}
                        description="Registered learner accounts"
                        icon={Users}
                    />
                    <StatCard
                        title="Total Courses"
                        value={stats.totalCourses.toLocaleString()}
                        description="Across all statuses"
                        icon={BookOpen}
                    />
                    <StatCard
                        title="Total Enrollments"
                        value={stats.totalEnrollments.toLocaleString()}
                        description="Active learning records"
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Completion Rate"
                        value={`${stats.completionRate}%`}
                        description="Of all enrolled courses"
                        icon={Award}
                    />
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Courses</CardTitle>
                            <CardDescription>Last 5 courses added to the platform</CardDescription>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/courses">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentCourses.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No courses yet. <Link href="/admin/courses/create" className="underline">Create the first one.</Link>
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Difficulty</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentCourses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-medium">{course.title}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariants[course.status] || 'secondary'} className="capitalize">
                                                    {course.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">{course.difficulty}</TableCell>
                                            <TableCell>{course.creator?.name ?? '—'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm">
                                                    <Link href={`/admin/courses/${course.id}/edit`}>Edit</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
