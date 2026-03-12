import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { ScrollText, User, Clock3, Info } from 'lucide-react';

function ActivityCard({ activity }) {
    const updatedFields = activity.properties?.updated_fields ?? [];

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium text-foreground">{activity.description}</p>
                            {activity.event && (
                                <Badge variant="outline" className="capitalize">{activity.event}</Badge>
                            )}
                            {activity.subject?.type && activity.subject.id && (
                                <Badge variant="secondary">{activity.subject.type} #{activity.subject.id}</Badge>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                {activity.causer?.name ?? 'System'}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="h-4 w-4" />
                                {activity.created_at}
                            </span>
                        </div>

                        {(updatedFields.length > 0 || activity.properties?.reason || activity.properties?.old_role || activity.properties?.title) && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                {activity.properties?.title && (
                                    <Badge variant="outline">{activity.properties.title}</Badge>
                                )}
                                {updatedFields.map((field) => (
                                    <Badge key={field} variant="outline">Updated: {field}</Badge>
                                ))}
                                {activity.properties?.old_role && activity.properties?.new_role && (
                                    <Badge variant="outline">{activity.properties.old_role} → {activity.properties.new_role}</Badge>
                                )}
                                {activity.properties?.source_course_id && (
                                    <Badge variant="outline">From course #{activity.properties.source_course_id}</Badge>
                                )}
                                {activity.properties?.source_section_id && (
                                    <Badge variant="outline">From section #{activity.properties.source_section_id}</Badge>
                                )}
                                {activity.properties?.source_lesson_id && (
                                    <Badge variant="outline">From lesson #{activity.properties.source_lesson_id}</Badge>
                                )}
                                {activity.properties?.lesson_count !== null && activity.properties?.lesson_count !== undefined && (
                                    <Badge variant="outline">{activity.properties.lesson_count} lessons</Badge>
                                )}
                                {activity.properties?.reason && (
                                    <Badge variant="outline">Reason: {activity.properties.reason}</Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ActivityLogsIndex({ activities }) {
    return (
        <AdminLayout title="Activity Logs">
            <Head title="Activity Logs" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Activity Logs</h2>
                    <p className="text-muted-foreground">Audit trail for admin content and user-management actions.</p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ScrollText className="h-5 w-5 text-primary" />
                            <CardTitle>Recent Activity</CardTitle>
                        </div>
                        <CardDescription>Newest events first.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activities.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                                <Info className="mb-4 h-10 w-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activities.data.map((activity) => (
                                    <ActivityCard key={activity.id} activity={activity} />
                                ))}
                            </div>
                        )}

                        {activities.last_page > 1 && (
                            <div className="mt-6 flex justify-center gap-2">
                                {activities.links.map((link, i) => (
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
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}