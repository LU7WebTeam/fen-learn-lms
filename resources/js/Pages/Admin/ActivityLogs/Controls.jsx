import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export default function ActivityLogControls({ capabilities, logSettings }) {
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
        <AdminLayout title="Activity Log Controls">
            <Head title="Activity Log Controls" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Activity Log Controls</h2>
                    <p className="text-muted-foreground">Manage retention, alerts, redaction, and access permissions.</p>
                    <div className="mt-3">
                        <Button asChild size="sm" variant="outline">
                            <Link href={route('admin.activity-logs.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Activity Logs
                            </Link>
                        </Button>
                    </div>
                </div>

                {!capabilities?.canManageLogPolicies ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Access Denied</CardTitle>
                            <CardDescription>Only super admins can manage activity log controls.</CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5 text-primary" />
                                    <CardTitle>Log Policies</CardTitle>
                                </div>
                                <CardDescription>Configure retention, archive, alerting, and redaction behavior.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={savePolicies} className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
                                        <Button type="submit" size="sm">Save log policies</Button>
                                        <Button type="button" variant="secondary" size="sm" onClick={runPruneNow}>Run prune now</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Access Control</CardTitle>
                                <CardDescription>Control who can view or export activity logs.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={savePolicies} className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-2">
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

                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button type="submit" size="sm">Save access controls</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
