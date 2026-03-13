import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { ScrollText, Info, Filter, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const PRESET_STORAGE_KEY = 'admin.activity-log.filter-presets.v1';

function ActivityDetails({ activity }) {
    const updatedFields = activity.properties?.updated_fields ?? [];

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {activity.properties?.title && (
                <Badge variant="outline">{activity.properties.title}</Badge>
            )}
            {updatedFields.map((field) => (
                <Badge key={field} variant="outline">Updated: {field}</Badge>
            ))}
            {activity.properties?.old_role && activity.properties?.new_role && (
                <Badge variant="outline">{activity.properties.old_role} to {activity.properties.new_role}</Badge>
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
    );
}

function selectedValuesFromEvent(e) {
    return Array.from(e.target.selectedOptions).map((option) => option.value);
}

function isoDateOffset(daysBack) {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    return d.toISOString().slice(0, 10);
}

function nonEmptyQuery(form, detailed) {
    const query = {};

    if (form.causer_id) query.causer_id = form.causer_id;
    if (form.search) query.search = form.search;
    if (form.subject_types.length > 0) query.subject_types = form.subject_types;
    if (form.events.length > 0) query.events = form.events;
    if (form.date_from) query.date_from = form.date_from;
    if (form.date_to) query.date_to = form.date_to;
    if (detailed) query.detailed = '1';

    return query;
}

function RiskBadge({ level }) {
    if (level === 'high') {
        return <Badge variant="destructive">High risk</Badge>;
    }

    if (level === 'medium') {
        return <Badge variant="outline">Medium risk</Badge>;
    }

    return null;
}

export default function ActivityLogsIndex({ activities, filters, options, capabilities, logSettings }) {
    const [form, setForm] = useState({
        causer_id: filters?.causer_id ?? '',
        search: filters?.search ?? '',
        subject_types: filters?.subject_types ?? [],
        events: filters?.events ?? [],
        date_from: filters?.date_from ?? '',
        date_to: filters?.date_to ?? '',
    });
    const [detailedExport, setDetailedExport] = useState(false);
    const [savedPresets, setSavedPresets] = useState([]);
    const [selectedPresetId, setSelectedPresetId] = useState('');
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [settingsForm, setSettingsForm] = useState({
        activity_log_retention_days: logSettings?.activity_log_retention_days ?? '180',
        activity_log_retention_unit: logSettings?.activity_log_retention_unit ?? 'days',
        activity_log_archive_before_prune: logSettings?.activity_log_archive_before_prune ?? '1',
        activity_log_alert_enabled: logSettings?.activity_log_alert_enabled ?? '0',
        activity_log_alert_recipients: logSettings?.activity_log_alert_recipients ?? '',
        activity_log_redaction_enabled: logSettings?.activity_log_redaction_enabled ?? '0',
        activity_log_redacted_keys: logSettings?.activity_log_redacted_keys ?? '',
        editor_can_view_activity_logs: logSettings?.editor_can_view_activity_logs ?? '1',
        editor_can_export_activity_logs: logSettings?.editor_can_export_activity_logs ?? '0',
    });

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
        () => (
            form.causer_id !== ''
            || form.search !== ''
            || form.subject_types.length > 0
            || form.events.length > 0
            || form.date_from !== ''
            || form.date_to !== ''
        ),
        [form],
    );

    const userSubjectTypeValues = useMemo(
        () => (options?.subjectTypes ?? [])
            .filter((subject) => /user|invitation/i.test(subject.label))
            .map((subject) => subject.value),
        [options],
    );

    const contentSubjectTypeValues = useMemo(
        () => (options?.subjectTypes ?? [])
            .filter((subject) => /course|section|lesson/i.test(subject.label))
            .map((subject) => subject.value),
        [options],
    );

    const userManagementEventValues = useMemo(
        () => (options?.events ?? []).filter((event) => /role|suspend|user/i.test(event)),
        [options],
    );

    const contentEventValues = useMemo(
        () => (options?.events ?? []).filter((event) => /create|update|delete|duplicate|reorder/i.test(event)),
        [options],
    );

    const exportUrl = useMemo(() => {
        return route('admin.activity-logs.export', nonEmptyQuery(form, detailedExport));
    }, [form, detailedExport]);

    const exportJsonUrl = useMemo(() => {
        return route('admin.activity-logs.export-json', nonEmptyQuery(form, detailedExport));
    }, [form, detailedExport]);

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
            search: '',
            subject_types: [],
            events: [],
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

    function openActivityDetails(activity) {
        setSelectedActivity(activity);
    }

    function closeActivityDetails() {
        setSelectedActivity(null);
    }

    function applyQuickRange(daysBack) {
        setForm((prev) => ({
            ...prev,
            date_from: isoDateOffset(daysBack),
            date_to: isoDateOffset(0),
        }));
    }

    function applyQuickScope(scope) {
        if (scope === 'user') {
            setForm((prev) => ({
                ...prev,
                subject_types: userSubjectTypeValues,
                events: userManagementEventValues,
            }));
            return;
        }

        if (scope === 'content') {
            setForm((prev) => ({
                ...prev,
                subject_types: contentSubjectTypeValues,
                events: contentEventValues,
            }));
        }
    }

    function savePolicies(e) {
        e.preventDefault();
        router.post(route('admin.activity-logs.settings.update'), settingsForm, {
            preserveScroll: true,
        });
    }

    function runPruneNow() {
        if (!window.confirm('Prune logs now based on current retention policy?')) return;

        router.post(route('admin.activity-logs.prune'), {}, {
            preserveScroll: true,
        });
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
                        <CardDescription>Narrow logs by actor, free-text search, subject, event, and date range.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
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
                                    <label className="text-xs font-medium text-muted-foreground">Search</label>
                                    <Input
                                        value={form.search}
                                        onChange={(e) => setForm((prev) => ({ ...prev, search: e.target.value }))}
                                        placeholder="Description or JSON property"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Subject types</label>
                                    <select
                                        multiple
                                        value={form.subject_types}
                                        onChange={(e) => setForm((prev) => ({ ...prev, subject_types: selectedValuesFromEvent(e) }))}
                                        className="h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        {(options?.subjectTypes ?? []).map((subject) => (
                                            <option key={subject.value} value={subject.value}>{subject.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Events</label>
                                    <select
                                        multiple
                                        value={form.events}
                                        onChange={(e) => setForm((prev) => ({ ...prev, events: selectedValuesFromEvent(e) }))}
                                        className="h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
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

                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => applyQuickRange(0)}>Today</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => applyQuickRange(6)}>Last 7 days</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => applyQuickScope('user')}>User-management only</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => applyQuickScope('content')}>Content edits only</Button>
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
                                {capabilities?.canExport && (
                                    <>
                                        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                            <input
                                                type="checkbox"
                                                checked={detailedExport}
                                                onChange={(e) => setDetailedExport(e.target.checked)}
                                            />
                                            Detailed export (flattened JSON)
                                        </label>
                                        <Button type="button" variant="secondary" size="sm" asChild>
                                            <a href={exportUrl}>Export CSV</a>
                                        </Button>
                                        <Button type="button" variant="secondary" size="sm" asChild>
                                            <a href={exportJsonUrl}>Export JSON</a>
                                        </Button>
                                    </>
                                )}
                                {hasActiveFilters && (
                                    <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {capabilities?.canManageLogPolicies && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-primary" />
                                <CardTitle>Log Policies and Access</CardTitle>
                            </div>
                            <CardDescription>Configure retention, alerts, redaction, and editor permissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={savePolicies} className="space-y-4">
                                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Retention value</label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={3650}
                                            value={settingsForm.activity_log_retention_days}
                                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, activity_log_retention_days: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Retention unit</label>
                                        <select
                                            value={settingsForm.activity_log_retention_unit}
                                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, activity_log_retention_unit: e.target.value }))}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="days">Days</option>
                                            <option value="months">Months</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Archive before prune</label>
                                        <select
                                            value={settingsForm.activity_log_archive_before_prune}
                                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, activity_log_archive_before_prune: e.target.value }))}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="1">Enabled</option>
                                            <option value="0">Disabled</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Editor can view logs</label>
                                        <select
                                            value={settingsForm.editor_can_view_activity_logs}
                                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, editor_can_view_activity_logs: e.target.value }))}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Editor can export logs</label>
                                        <select
                                            value={settingsForm.editor_can_export_activity_logs}
                                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, editor_can_export_activity_logs: e.target.value }))}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Critical alert emails (comma separated)</label>
                                        <Input
                                            value={settingsForm.activity_log_alert_recipients}
                                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, activity_log_alert_recipients: e.target.value }))}
                                            placeholder="admin@example.com, security@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Redacted property keys (comma separated)</label>
                                        <Input
                                            value={settingsForm.activity_log_redacted_keys}
                                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, activity_log_redacted_keys: e.target.value }))}
                                            placeholder="email,password,token"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">High-risk alerting</label>
                                        <select
                                            value={settingsForm.activity_log_alert_enabled}
                                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, activity_log_alert_enabled: e.target.value }))}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="1">Enabled</option>
                                            <option value="0">Disabled</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">Redaction in UI and exports</label>
                                        <select
                                            value={settingsForm.activity_log_redaction_enabled}
                                            onChange={(e) => setSettingsForm((prev) => ({ ...prev, activity_log_redaction_enabled: e.target.value }))}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="1">Enabled</option>
                                            <option value="0">Disabled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Button type="submit" size="sm">Save policies</Button>
                                    <Button type="button" variant="secondary" size="sm" onClick={runPruneNow}>Run prune now</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

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
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Risk</TableHead>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Actor</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activities.data.map((activity) => (
                                            <TableRow
                                                key={activity.id}
                                                className="cursor-pointer"
                                                onClick={() => openActivityDetails(activity)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        openActivityDetails(activity);
                                                    }
                                                }}
                                                tabIndex={0}
                                            >
                                                <TableCell className="font-medium min-w-[220px]">{activity.description}</TableCell>
                                                <TableCell>
                                                    <RiskBadge level={activity.risk_level} />
                                                </TableCell>
                                                <TableCell>
                                                    {activity.event ? (
                                                        <Badge variant="outline" className="capitalize">{activity.event}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {activity.subject?.type && activity.subject?.id ? (
                                                        <Badge variant="secondary">{activity.subject.type} #{activity.subject.id}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{activity.causer?.name ?? 'System'}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{activity.created_at}</TableCell>
                                                <TableCell className="min-w-[260px]">
                                                    <ActivityDetails activity={activity} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        <Sheet open={Boolean(selectedActivity)} onOpenChange={(open) => !open && closeActivityDetails()}>
                            <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>Activity details</SheetTitle>
                                    <SheetDescription>
                                        Full event metadata and payload for audit review.
                                    </SheetDescription>
                                </SheetHeader>

                                {selectedActivity && (
                                    <div className="mt-6 space-y-6">
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Summary</h3>
                                            <p className="text-base font-medium">{selectedActivity.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">ID: {selectedActivity.id}</Badge>
                                                <RiskBadge level={selectedActivity.risk_level} />
                                                {selectedActivity.event && (
                                                    <Badge variant="outline" className="capitalize">{selectedActivity.event}</Badge>
                                                )}
                                                {selectedActivity.subject?.type && selectedActivity.subject?.id && (
                                                    <Badge variant="secondary">{selectedActivity.subject.type} #{selectedActivity.subject.id}</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid gap-3 rounded-md border p-4 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">Actor</p>
                                                <p className="text-sm">{selectedActivity.causer?.name ?? 'System'}</p>
                                                {selectedActivity.causer?.email && (
                                                    <p className="text-xs text-muted-foreground">{selectedActivity.causer.email}</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">Time</p>
                                                <p className="text-sm">{selectedActivity.created_at}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Highlights</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {(selectedActivity.properties?.updated_fields ?? []).map((field) => (
                                                    <Badge key={field} variant="outline">Updated: {field}</Badge>
                                                ))}
                                                {selectedActivity.properties?.old_role && selectedActivity.properties?.new_role && (
                                                    <Badge variant="outline">{selectedActivity.properties.old_role} to {selectedActivity.properties.new_role}</Badge>
                                                )}
                                                {selectedActivity.properties?.reason && (
                                                    <Badge variant="outline">Reason: {selectedActivity.properties.reason}</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Raw properties</h3>
                                            <pre className="max-h-[320px] overflow-auto rounded-md border bg-muted p-3 text-xs leading-relaxed">
                                                {JSON.stringify(selectedActivity.raw_properties ?? {}, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </SheetContent>
                        </Sheet>

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