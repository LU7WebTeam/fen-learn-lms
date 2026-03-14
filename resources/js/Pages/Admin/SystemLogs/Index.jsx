import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { ScrollText } from 'lucide-react';
import { useMemo, useState } from 'react';

function levelVariant(level) {
    if (level === 'error') return 'destructive';
    if (level === 'warning') return 'outline';
    return 'secondary';
}

function exportQuery(form) {
    const query = {};

    if (form.level) query.level = form.level;
    if (form.search) query.search = form.search;
    if (form.request_id) query.request_id = form.request_id;
    if (form.user_id) query.user_id = form.user_id;
    if (form.date_from) query.date_from = form.date_from;
    if (form.date_to) query.date_to = form.date_to;

    return query;
}

export default function SystemLogsIndex({ logs, filters, options }) {
    const [form, setForm] = useState({
        level: filters?.level ?? '',
        search: filters?.search ?? '',
        request_id: filters?.request_id ?? '',
        user_id: filters?.user_id ?? '',
        date_from: filters?.date_from ?? '',
        date_to: filters?.date_to ?? '',
    });
    const [selectedLog, setSelectedLog] = useState(null);

    const csvUrl = useMemo(() => route('admin.system-logs.export', exportQuery(form)), [form]);
    const jsonUrl = useMemo(() => route('admin.system-logs.export', { ...exportQuery(form), format: 'json' }), [form]);

    function applyFilters(e) {
        e.preventDefault();
        router.get(route('admin.system-logs.index'), form, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function clearFilters() {
        const cleared = {
            level: '',
            search: '',
            request_id: '',
            user_id: '',
            date_from: '',
            date_to: '',
        };

        setForm(cleared);
        router.get(route('admin.system-logs.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    return (
        <AdminLayout title="System Logs">
            <Head title="System Logs" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
                    <p className="text-muted-foreground">Technical runtime logs for integrations, auth flows, and platform operations.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ScrollText className="h-5 w-5 text-primary" /> Filters
                        </CardTitle>
                        <CardDescription>Filter logs by level, date range, search term, request id, and user id.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Level</label>
                                    <select
                                        value={form.level}
                                        onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">All levels</option>
                                        {(options?.levels ?? []).map((level) => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Search</label>
                                    <Input
                                        value={form.search}
                                        onChange={(e) => setForm((prev) => ({ ...prev, search: e.target.value }))}
                                        placeholder="Message or context"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Request ID</label>
                                    <Input
                                        value={form.request_id}
                                        onChange={(e) => setForm((prev) => ({ ...prev, request_id: e.target.value }))}
                                        placeholder="Request ID"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">User ID</label>
                                    <Input
                                        type="number"
                                        value={form.user_id}
                                        onChange={(e) => setForm((prev) => ({ ...prev, user_id: e.target.value }))}
                                        placeholder="User ID"
                                    />
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
                                <Button type="submit" size="sm">Apply filters</Button>
                                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
                                <Button type="button" variant="secondary" size="sm" asChild>
                                    <a href={csvUrl}>Export CSV</a>
                                </Button>
                                <Button type="button" variant="secondary" size="sm" asChild>
                                    <a href={jsonUrl}>Export JSON</a>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Log Entries</CardTitle>
                        <CardDescription>{logs?.total ?? 0} matching system log entries.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(logs?.data ?? []).length === 0 ? (
                            <div className="rounded-md border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                                No system logs matched the selected filters.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>Level</TableHead>
                                            <TableHead>Message</TableHead>
                                            <TableHead>Request</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Route</TableHead>
                                            <TableHead>Source</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(logs?.data ?? []).map((entry) => (
                                            <TableRow key={`${entry.timestamp_raw}-${entry.message}-${entry.request_id || 'none'}`} className="cursor-pointer" onClick={() => setSelectedLog(entry)}>
                                                <TableCell className="whitespace-nowrap">{entry.timestamp}</TableCell>
                                                <TableCell><Badge variant={levelVariant(entry.level)}>{entry.level}</Badge></TableCell>
                                                <TableCell className="max-w-[420px] truncate">{entry.message}</TableCell>
                                                <TableCell className="font-mono text-xs">{entry.request_id ?? '-'}</TableCell>
                                                <TableCell>{entry.user_id ?? '-'}</TableCell>
                                                <TableCell>{entry.route_name ?? entry.request_path ?? '-'}</TableCell>
                                                <TableCell>{entry.source_file}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {logs?.links && logs.links.length > 3 && (
                            <div className="flex flex-wrap items-center gap-2">
                                {logs.links.map((link, index) => (
                                    <Button
                                        key={`${link.label}-${index}`}
                                        type="button"
                                        size="sm"
                                        variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url, { preserveScroll: true, preserveState: true })}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedLog && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Selected Entry</CardTitle>
                                    <CardDescription>{selectedLog.timestamp}</CardDescription>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedLog(null)}>Close</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                <div><p className="text-xs text-muted-foreground">Level</p><p className="text-sm font-medium">{selectedLog.level}</p></div>
                                <div><p className="text-xs text-muted-foreground">Request ID</p><p className="text-sm font-mono">{selectedLog.request_id ?? '-'}</p></div>
                                <div><p className="text-xs text-muted-foreground">User ID</p><p className="text-sm">{selectedLog.user_id ?? '-'}</p></div>
                                <div><p className="text-xs text-muted-foreground">Route</p><p className="text-sm">{selectedLog.route_name ?? '-'}</p></div>
                                <div><p className="text-xs text-muted-foreground">Path</p><p className="text-sm">{selectedLog.request_path ?? '-'}</p></div>
                                <div><p className="text-xs text-muted-foreground">IP</p><p className="text-sm">{selectedLog.request_ip ?? '-'}</p></div>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Message</p>
                                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">{selectedLog.message}</div>
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-muted-foreground">Context</p>
                                <pre className="max-h-96 overflow-auto rounded-md border bg-muted/30 p-3 text-xs">{JSON.stringify(selectedLog.context ?? {}, null, 2)}</pre>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
