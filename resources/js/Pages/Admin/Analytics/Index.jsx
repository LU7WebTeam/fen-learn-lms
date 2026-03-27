import { useState, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Users,
    GraduationCap,
    TrendingUp,
    Award,
    BookOpen,
    HelpCircle,
    RotateCcw,
    Filter,
    ChevronDown,
    ChevronUp,
    Download,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────

const MALAYSIAN_STATES = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
    'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor',
    'Terengganu', 'Wilayah Persekutuan Kuala Lumpur',
    'Wilayah Persekutuan Labuan', 'Wilayah Persekutuan Putrajaya',
];

const OCCUPATIONS = [
    { value: 'student',       label: 'Student' },
    { value: 'government',    label: 'Government' },
    { value: 'private',       label: 'Private Sector' },
    { value: 'self_employed', label: 'Self-employed' },
    { value: 'professional',  label: 'Professional' },
    { value: 'academic',      label: 'Academic' },
    { value: 'homemaker',     label: 'Homemaker' },
    { value: 'retired',       label: 'Retired' },
    { value: 'unemployed',    label: 'Unemployed' },
    { value: 'other',         label: 'Other' },
];

const RACES = [
    { value: 'malay',            label: 'Malay' },
    { value: 'chinese',          label: 'Chinese' },
    { value: 'indian',           label: 'Indian' },
    { value: 'other_bumiputera', label: 'Other Bumiputera' },
    { value: 'other',            label: 'Other' },
];

const AGE_GROUPS = [
    { value: 'under_18', label: 'Under 18' },
    { value: '18_24',    label: '18–24' },
    { value: '25_34',    label: '25–34' },
    { value: '35_44',    label: '35–44' },
    { value: '45_54',    label: '45–54' },
    { value: '55_plus',  label: '55+' },
];

// Chart colour palette (matches Tailwind indigo/teal/violet/amber/rose)
const CHART_COLORS = {
    primary:   '#6366f1',
    secondary: '#14b8a6',
    accent:    '#f59e0b',
    danger:    '#ef4444',
    muted:     '#94a3b8',
};
const PIE_PALETTE = ['#6366f1', '#14b8a6', '#f59e0b', '#f472b6', '#a78bfa', '#34d399', '#fb923c', '#60a5fa'];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, sub, highlight = false }) {
    return (
        <Card className="border-0 shadow-sm bg-muted/30">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 truncate">{label}</p>
                        <p className={`text-3xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
                        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                    </div>
                    <div className="rounded-lg p-2.5 bg-muted/50 shrink-0">
                        <Icon className={`h-5 w-5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SectionTitle({ children }) {
    return (
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {children}
        </h3>
    );
}

function EmptyChart({ label = 'No data for this period' }) {
    return (
        <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
            {label}
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
            <p className="font-medium text-foreground mb-1">{label}</p>
            {payload.map((entry) => (
                <p key={entry.dataKey} style={{ color: entry.color }}>
                    {entry.name}: <span className="font-semibold">{entry.value}</span>
                </p>
            ))}
        </div>
    );
}

function TrendChart({ data }) {
    if (!data?.length || data.every(d => d.enrollments === 0 && d.completions === 0)) {
        return <EmptyChart />;
    }

    // Thin out x-axis labels when there are many data points
    const tickCount = data.length;
    const tickInterval = tickCount <= 14 ? 0 : tickCount <= 31 ? 2 : Math.floor(tickCount / 10);

    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    interval={tickInterval}
                    tickFormatter={d => {
                        const dt = new Date(d);
                        return `${dt.getMonth() + 1}/${dt.getDate()}`;
                    }}
                />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                    type="monotone"
                    dataKey="enrollments"
                    name="Enrollments"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="completions"
                    name="Completions"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

function LessonFunnelChart({ data }) {
    if (!data?.length) return <EmptyChart label="No lessons found" />;

    return (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                    type="category"
                    dataKey="title"
                    width={160}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={v => v.length > 22 ? v.slice(0, 22) + '…' : v}
                />
                <Tooltip
                    formatter={(value, name, props) => [
                        `${value}% (${props.payload.completed_count} learners)`,
                        'Completion'
                    ]}
                    contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="completion_rate" name="Completion %" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

function DemographicBarChart({ data, color = CHART_COLORS.secondary }) {
    if (!data?.length) return <EmptyChart />;

    return (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    allowDecimals={false}
                />
                <YAxis
                    type="category"
                    dataKey="label"
                    width={130}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v}
                />
                <Tooltip
                    formatter={(value) => [value, 'Learners']}
                    contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="count" name="Learners" fill={color} radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

function DemographicPieChart({ data }) {
    if (!data?.length) return <EmptyChart />;

    const total = data.reduce((s, d) => s + d.count, 0);
    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                >
                    {data.map((_, idx) => (
                        <Cell key={idx} fill={PIE_PALETTE[idx % PIE_PALETTE.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => [`${value} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`, 'Learners']}
                    contentStyle={{ fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
        </ResponsiveContainer>
    );
}

function QuizStatsChart({ data }) {
    if (!data?.length) return <EmptyChart label="No quiz lessons in this course" />;

    return (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                    type="category"
                    dataKey="title"
                    width={150}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={v => v.length > 22 ? v.slice(0, 22) + '…' : v}
                />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="pass_rate" name="Pass Rate %" fill={CHART_COLORS.secondary} radius={[0, 2, 2, 0]} />
                <Bar dataKey="avg_score" name="Avg Score %" fill={CHART_COLORS.accent} radius={[0, 2, 2, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({ courses, filters, onFiltersChange, onApply, onReset, onExport }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="bg-card border border-border rounded-xl shadow-sm">
            {/* Top row: Course selector + date range + toggle */}
            <div className="flex flex-wrap items-end gap-3 p-4">
                {/* Course */}
                <div className="min-w-[220px] flex-1">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Course</label>
                    <Select
                        value={String(filters.course_id ?? '')}
                        onValueChange={v => onFiltersChange('course_id', Number(v))}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a course…" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(c => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    <span className="truncate">{c.title}</span>
                                    {c.status !== 'published' && (
                                        <Badge variant="outline" className="ml-2 text-[10px] py-0">{c.status}</Badge>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date range */}
                <div className="flex gap-2 items-end">
                    <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">From</label>
                        <input
                            type="date"
                            value={filters.date_from ?? ''}
                            onChange={e => onFiltersChange('date_from', e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">To</label>
                        <input
                            type="date"
                            value={filters.date_to ?? ''}
                            min={filters.date_from ?? undefined}
                            onChange={e => onFiltersChange('date_to', e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>
                </div>

                {/* Learner profile filters toggle */}
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 self-end"
                    onClick={() => setExpanded(x => !x)}
                >
                    <Filter className="h-3.5 w-3.5" />
                    Learner Filters
                    {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </Button>

                {/* Actions */}
                <div className="flex gap-2 self-end ml-auto">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={onExport}>
                        <Download className="h-3.5 w-3.5" />
                        Export CSV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={onReset}>
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={onApply}>
                        Apply
                    </Button>
                </div>
            </div>

            {/* Expandable learner profile filters */}
            {expanded && (
                <>
                    <Separator />
                    <div className="flex flex-wrap gap-3 p-4">
                        {/* Gender */}
                        <div className="min-w-[130px]">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Gender</label>
                            <Select
                                value={filters.gender || '__all__'}
                                onValueChange={v => onFiltersChange('gender', v === '__all__' ? '' : v)}
                            >
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All Genders</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Race */}
                        <div className="min-w-[160px]">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Race / Ethnicity</label>
                            <Select
                                value={filters.race || '__all__'}
                                onValueChange={v => onFiltersChange('race', v === '__all__' ? '' : v)}
                            >
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All</SelectItem>
                                    {RACES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* State */}
                        <div className="min-w-[200px]">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">State</label>
                            <Select
                                value={filters.state || '__all__'}
                                onValueChange={v => onFiltersChange('state', v === '__all__' ? '' : v)}
                            >
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All States</SelectItem>
                                    {MALAYSIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Occupation */}
                        <div className="min-w-[180px]">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Occupation</label>
                            <Select
                                value={filters.occupation || '__all__'}
                                onValueChange={v => onFiltersChange('occupation', v === '__all__' ? '' : v)}
                            >
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All Occupations</SelectItem>
                                    {OCCUPATIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Age group */}
                        <div className="min-w-[140px]">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Age Group</label>
                            <Select
                                value={filters.age_group || '__all__'}
                                onValueChange={v => onFiltersChange('age_group', v === '__all__' ? '' : v)}
                            >
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__all__">All Ages</SelectItem>
                                    {AGE_GROUPS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Active filter badges ─────────────────────────────────────────────────────

function ActiveFilterBadges({ filters, onRemove }) {
    const profileFilters = [
        { key: 'gender',     label: filters.gender     ? `Gender: ${ucfirst(filters.gender)}` : null },
        { key: 'race',       label: filters.race       ? `Race: ${RACES.find(r => r.value === filters.race)?.label ?? filters.race}` : null },
        { key: 'state',      label: filters.state      ? `State: ${filters.state}` : null },
        { key: 'occupation', label: filters.occupation ? `Occupation: ${OCCUPATIONS.find(o => o.value === filters.occupation)?.label ?? filters.occupation}` : null },
        { key: 'age_group',  label: filters.age_group  ? `Age: ${AGE_GROUPS.find(g => g.value === filters.age_group)?.label ?? filters.age_group}` : null },
    ].filter(f => f.label);

    if (!profileFilters.length) return null;

    return (
        <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {profileFilters.map(f => (
                <Badge
                    key={f.key}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive text-xs"
                    onClick={() => onRemove(f.key)}
                >
                    {f.label}
                    <span className="ml-0.5">×</span>
                </Badge>
            ))}
        </div>
    );
}

function ucfirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsIndex({ courses, selectedCourse, analytics, filters: serverFilters }) {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        course_id:  serverFilters?.course_id  ?? courses[0]?.id ?? null,
        date_from:  serverFilters?.date_from  ?? thirtyDaysAgo,
        date_to:    serverFilters?.date_to    ?? today,
        gender:     serverFilters?.gender     ?? '',
        race:       serverFilters?.race       ?? '',
        state:      serverFilters?.state      ?? '',
        occupation: serverFilters?.occupation ?? '',
        age_group:  serverFilters?.age_group  ?? '',
    });

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleApply = useCallback(() => {
        const params = {};
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) params[k] = v;
        });
        router.get(route('admin.analytics.index'), params, {
            preserveState: true,
            replace: true,
        });
    }, [filters]);

    const handleReset = useCallback(() => {
        const reset = {
            course_id:  filters.course_id,
            date_from:  thirtyDaysAgo,
            date_to:    today,
            gender:     '',
            race:       '',
            state:      '',
            occupation: '',
            age_group:  '',
        };
        setFilters(reset);
        const params = { course_id: reset.course_id, date_from: reset.date_from, date_to: reset.date_to };
        router.get(route('admin.analytics.index'), params, { preserveState: true, replace: true });
    }, [filters.course_id]);

    const handleRemoveFilter = useCallback((key) => {
        const updated = { ...filters, [key]: '' };
        setFilters(updated);
        const params = {};
        Object.entries(updated).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) params[k] = v;
        });
        router.get(route('admin.analytics.index'), params, { preserveState: true, replace: true });
    }, [filters]);

    const handleExport = useCallback(() => {
        const params = {};
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) params[k] = v;
        });

        const qs = new URLSearchParams(params).toString();
        const url = `${route('admin.analytics.export')}${qs ? `?${qs}` : ''}`;
        window.location.href = url;
    }, [filters]);

    const summary = analytics?.summary;
    const hasDemographicData = (arr) => arr?.some(d => d.count > 0);

    return (
        <AdminLayout title="Course Analytics">
            <Head title="Course Analytics" />

            <div className="space-y-6">

                {/* ── Page header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Course Analytics</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Drill into enrollment, completion, and learner demographics for any course.
                        </p>
                    </div>
                    {selectedCourse && (
                        <Badge variant="outline" className="text-sm px-3 py-1 hidden sm:flex">
                            {selectedCourse.title}
                        </Badge>
                    )}
                </div>

                {/* ── Filter bar ── */}
                <FilterBar
                    courses={courses}
                    filters={filters}
                    onFiltersChange={handleFilterChange}
                    onApply={handleApply}
                    onReset={handleReset}
                    onExport={handleExport}
                />

                {/* Active filter badges */}
                <ActiveFilterBadges filters={filters} onRemove={handleRemoveFilter} />

                {!analytics ? (
                    <Card className="border-dashed">
                        <CardContent className="py-16 text-center text-muted-foreground">
                            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No course selected</p>
                            <p className="text-sm mt-1">Select a course above to view analytics.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* ── Summary cards ── */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                            <MetricCard
                                icon={Users}
                                label="Total Enrollments"
                                value={summary.total_enrollments.toLocaleString()}
                                highlight
                            />
                            <MetricCard
                                icon={GraduationCap}
                                label="Completions"
                                value={summary.total_completions.toLocaleString()}
                                sub={`${summary.completion_rate}% rate`}
                            />
                            <MetricCard
                                icon={TrendingUp}
                                label="Completion Rate"
                                value={`${summary.completion_rate}%`}
                            />
                            <MetricCard
                                icon={Award}
                                label="Avg Progress"
                                value={`${summary.avg_progress}%`}
                                sub="across enrolled learners"
                            />
                            <MetricCard
                                icon={HelpCircle}
                                label="Avg Quiz Score"
                                value={summary.avg_quiz_score > 0 ? `${summary.avg_quiz_score}%` : '—'}
                            />
                            <MetricCard
                                icon={BookOpen}
                                label="Total Lessons"
                                value={summary.total_lessons.toLocaleString()}
                            />
                        </div>

                        {/* ── Enrollment & completion trend ── */}
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">Enrollment &amp; Completion Over Time</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    New enrollments and course completions within the selected date range
                                </p>
                            </CardHeader>
                            <CardContent>
                                <TrendChart data={analytics.trend} />
                            </CardContent>
                        </Card>

                        {/* ── Lesson funnel + Quiz stats ── */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            <Card className="border shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">Lesson Completion Funnel</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        % of enrolled learners who completed each lesson
                                    </p>
                                </CardHeader>
                                <CardContent className="overflow-y-auto max-h-[420px]">
                                    <LessonFunnelChart data={analytics.lessonFunnel} />
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-semibold">Quiz Performance</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Pass rate and average score per quiz lesson
                                    </p>
                                </CardHeader>
                                <CardContent className="overflow-y-auto max-h-[420px]">
                                    <QuizStatsChart data={analytics.quizStats} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Demographics ── */}
                        <div>
                            <SectionTitle>Learner Demographics</SectionTitle>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

                                {/* By Race (pie) */}
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold">By Race / Ethnicity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {hasDemographicData(analytics.demographics.by_race)
                                            ? <DemographicPieChart data={analytics.demographics.by_race} />
                                            : <EmptyChart />}
                                    </CardContent>
                                </Card>

                                {/* By Gender (pie) */}
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold">By Gender</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {hasDemographicData(analytics.demographics.by_gender)
                                            ? <DemographicPieChart data={analytics.demographics.by_gender} />
                                            : <EmptyChart />}
                                    </CardContent>
                                </Card>

                                {/* By Age Group (bar) */}
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold">By Age Group</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {hasDemographicData(analytics.demographics.by_age_group)
                                            ? <DemographicBarChart data={analytics.demographics.by_age_group} color={CHART_COLORS.accent} />
                                            : <EmptyChart />}
                                    </CardContent>
                                </Card>

                                {/* By State (horizontal bar) */}
                                <Card className="border shadow-sm md:col-span-2 xl:col-span-2">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold">By State</CardTitle>
                                    </CardHeader>
                                    <CardContent className="overflow-y-auto max-h-[320px]">
                                        {hasDemographicData(analytics.demographics.by_state)
                                            ? <DemographicBarChart data={analytics.demographics.by_state} color={CHART_COLORS.primary} />
                                            : <EmptyChart />}
                                    </CardContent>
                                </Card>

                                {/* By Occupation (horizontal bar) */}
                                <Card className="border shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-semibold">By Occupation</CardTitle>
                                    </CardHeader>
                                    <CardContent className="overflow-y-auto max-h-[320px]">
                                        {hasDemographicData(analytics.demographics.by_occupation)
                                            ? <DemographicBarChart data={analytics.demographics.by_occupation} color={CHART_COLORS.secondary} />
                                            : <EmptyChart />}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
