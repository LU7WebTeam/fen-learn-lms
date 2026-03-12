import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ScrollText, User, Clock3, Info, Filter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const PRESET_STORAGE_KEY = 'admin.activity-log.filter-presets.v1';

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

export default function ActivityLogsIndex({ activities, filters, options }) {
    const [form, setForm] = useState({
        causer_id: filters?.causer_id ?? '',
        subject_type: filters?.subject_type ?? '',
        event: filters?.event ?? '',
        date_from: filters?.date_from ?? '',
        date_to: filters?.date_to ?? '',
    });
    const [savedPresets, setSavedPresets] = useState([]);
    const [selectedPresetId, setSelectedPresetId] = useState('');

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
            if (!raw) return;

            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setSavedPresets(parsed);
            }
        } catch {
            setSavedPresets([]);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(savedPresets));
    }, [savedPresets]);

    const hasActiveFilters = useMemo(
        () => Object.values(form).some((value) => value !== ''),
        [form],
    );

    const exportUrl = useMemo(() => {
        const query = Object.fromEntries(
            Object.entries(form).filter(([, value]) => value !== ''),
        );

        return route('admin.activity-logs.export', query);
    }, [form]);

    const exportJsonUrl = useMemo(() => {
        const query = Object.fromEntries(
            Object.entries(form).filter(([, value]) => value !== ''),
        );

        return route('admin.activity-logs.export-json', query);
    }, [form]);

    function applyFilters(e) {
        e.preventDefault();
        router.get(route('admin.activity-logs.index'), form, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function clearFilters() {
        const cleared = {
            causer_id: '',
            subject_type: '',
            event: '',
            date_from: '',
            date_to: '',
        };

        setForm(cleared);
        router.get(route('admin.activity-logs.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function saveCurrentPreset() {
        const name = window.prompt('Preset name');
        if (!name || !name.trim()) return;

        const id = `${Date.now()}`;
        const preset = {
            id,
            name: name.trim(),
            filters: { ...form },
        };

        setSavedPresets((prev) => [...prev, preset]);
        setSelectedPresetId(id);
    }

    function applySelectedPreset() {
        if (!selectedPresetId) return;

        const preset = savedPresets.find((item) => item.id === selectedPresetId);
        if (!preset) return;

        setForm(preset.filters);
    }

    function deleteSelectedPreset() {
        if (!selectedPresetId) return;

        setSavedPresets((prev) => prev.filter((item) => item.id !== selectedPresetId));
        setSelectedPresetId('');
    }

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
                            <Filter className="h-5 w-5 text-primary" />
                            <CardTitle>Filters</CardTitle>
                        </div>
                        <CardDescription>Narrow logs by actor, subject, event, or date range.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Actor</label>
                                    <select
                                        value={form.causer_id}
                                        onChange={(e) => setForm((prev) => ({ ...prev, causer_id: e.target.value }))}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">All actors</option>
                                        {(options?.actors ?? []).map((actor) => (
                                            <option key={actor.id} value={actor.id}>{actor.name} ({actor.email})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Subject</label>
                                    <select
                                        value={form.subject_type}
                                        onChange={(e) => setForm((prev) => ({ ...prev, subject_type: e.target.value }))}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">All subjects</option>
                                        {(options?.subjectTypes ?? []).map((subject) => (
                                            <option key={subject.value} value={subject.value}>{subject.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Event</label>
                                    <select
                                        value={form.event}
                                        onChange={(e) => setForm((prev) => ({ ...prev, event: e.target.value }))}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">All events</option>
                                        {(options?.events ?? []).map((event) => (
                                            <option key={event} value={event} className="capitalize">{event}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Date from</label>
                                    <Input
                                        type="date"
                                        value={form.date_from}
                                        onChange={(e) => setForm((prev) => ({ ...prev, date_from: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Date to</label>
                                    <Input
                                        type="date"
                                        value={form.date_to}
                                        onChange={(e) => setForm((prev) => ({ ...prev, date_to: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
                                <select
                                    value={selectedPresetId}
                                    onChange={(e) => setSelectedPresetId(e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Saved presets</option>
                                    {savedPresets.map((preset) => (
                                        <option key={preset.id} value={preset.id}>{preset.name}</option>
                                    ))}
                                </select>
                                <Button type="button" variant="outline" size="sm" onClick={applySelectedPreset} disabled={!selectedPresetId}>Apply preset</Button>
                                <Button type="button" variant="outline" size="sm" onClick={saveCurrentPreset}>Save current</Button>
                                <Button type="button" variant="ghost" size="sm" onClick={deleteSelectedPreset} disabled={!selectedPresetId}>Delete preset</Button>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="submit" size="sm">Apply filters</Button>
                                <Button type="button" variant="secondary" size="sm" asChild>
                                    <a href={exportUrl}>Export CSV</a>
                                </Button>
                                <Button type="button" variant="secondary" size="sm" asChild>
                                    <a href={exportJsonUrl}>Export JSON</a>
                                </Button>
                                {hasActiveFilters && (
                                    <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

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
                                        onClick={() => link.url && router.get(link.url, {}, {
                                            preserveState: true,
                                            preserveScroll: true,
                                        })}
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