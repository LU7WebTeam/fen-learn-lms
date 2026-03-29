import { useState, useCallback, useMemo, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Progress } from '@/Components/ui/progress';
import { Separator } from '@/Components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import InputError from '@/Components/InputError';
import SearchableSelect from '@/Components/SearchableSelect';
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
    Search,
    ExternalLink,
    CheckCircle2,
    Clock,
    Mail,
    CalendarDays,
    Activity,
    MapPin,
    Briefcase,
    Building2,
    User,
    Pencil,
    X,
    Save,
    Video,
    FileText,
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
import {
    ORGANIZATION_OTHER_VALUE,
    splitOrganizationValue,
    usesOrganizationList,
} from '@/lib/profileOrganizations';

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

const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];

const LESSON_ICONS = { video: Video, text: FileText, quiz: HelpCircle };

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
                            <SearchableSelect
                                multiple
                                options={GENDER_OPTIONS}
                                values={filters.gender}
                                onValuesChange={values => onFiltersChange('gender', values)}
                                placeholder="All genders"
                                searchPlaceholder="Search genders..."
                                contentClassName="w-[220px]"
                            />
                        </div>

                        {/* Race */}
                        <div className="min-w-[160px]">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Race / Ethnicity</label>
                            <SearchableSelect
                                multiple
                                options={RACES}
                                values={filters.race}
                                onValuesChange={values => onFiltersChange('race', values)}
                                placeholder="All races"
                                searchPlaceholder="Search races..."
                            />
                        </div>

                        {/* State */}
                        <div className="min-w-[200px]">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">State</label>
                            <SearchableSelect
                                multiple
                                options={MALAYSIAN_STATES}
                                values={filters.state}
                                onValuesChange={values => onFiltersChange('state', values)}
                                placeholder="All states"
                                searchPlaceholder="Search states..."
                            />
                        </div>

                        {/* Occupation */}
                        <div className="min-w-[180px]">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Occupation</label>
                            <SearchableSelect
                                multiple
                                options={OCCUPATIONS}
                                values={filters.occupation}
                                onValuesChange={values => onFiltersChange('occupation', values)}
                                placeholder="All occupations"
                                searchPlaceholder="Search occupations..."
                            />
                        </div>

                        {/* Age group */}
                        <div className="min-w-[140px]">
                            <label className="text-xs font-medium text-muted-foreground block mb-1">Age Group</label>
                            <SearchableSelect
                                multiple
                                options={AGE_GROUPS}
                                values={filters.age_group}
                                onValuesChange={values => onFiltersChange('age_group', values)}
                                placeholder="All ages"
                                searchPlaceholder="Search age groups..."
                            />
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
        ...(filters.gender ?? []).map(value => ({ key: 'gender', value, label: `Gender: ${ucfirst(value)}` })),
        ...(filters.race ?? []).map(value => ({ key: 'race', value, label: `Race: ${RACES.find(r => r.value === value)?.label ?? value}` })),
        ...(filters.state ?? []).map(value => ({ key: 'state', value, label: `State: ${value}` })),
        ...(filters.occupation ?? []).map(value => ({ key: 'occupation', value, label: `Occupation: ${OCCUPATIONS.find(o => o.value === value)?.label ?? value}` })),
        ...(filters.age_group ?? []).map(value => ({ key: 'age_group', value, label: `Age: ${AGE_GROUPS.find(g => g.value === value)?.label ?? value}` })),
    ];

    if (!profileFilters.length) return null;

    return (
        <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {profileFilters.map(f => (
                <Badge
                    key={`${f.key}-${f.value}`}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive text-xs"
                    onClick={() => onRemove(f.key, f.value)}
                >
                    {f.label}
                    <span className="ml-0.5">×</span>
                </Badge>
            ))}
        </div>
    );
}

function Avatar({ name, src, size = 'md' }) {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';
    const sizeClass = size === 'lg' ? 'h-14 w-14 text-lg' : 'h-8 w-8 text-xs';

    return (
        <div className={`${sizeClass} rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center font-semibold text-indigo-700 shrink-0`}>
            {src
                ? <img src={src} alt={name} className="h-full w-full object-cover" />
                : <span>{initials}</span>
            }
        </div>
    );
}

function LearnerProfileDialog({ learner, course, open, onClose }) {
    const { profileOptions } = usePage().props;
    const organizationOptions = profileOptions?.organizationOptions ?? [];
    const organizationSelectOccupations = profileOptions?.organizationSelectOccupations ?? ['student', 'academic'];
    const [editing, setEditing] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        name:         '',
        email:        '',
        gender:       '',
        race:         '',
        state:        '',
        birthdate:    '',
        occupation:   '',
        organization: '',
        organization_other: '',
    });

    useEffect(() => {
        if (learner) {
            const organizationState = splitOrganizationValue(
                learner.user_occupation ?? '',
                learner.user_organization ?? '',
                organizationOptions,
                organizationSelectOccupations,
            );

            reset();
            setData({
                name:         learner.user_name          ?? '',
                email:        learner.user_email         ?? '',
                gender:       learner.user_gender        ?? '',
                race:         learner.user_race          ?? '',
                state:        learner.user_state         ?? '',
                birthdate:    learner.user_birthdate_raw ?? '',
                occupation:   learner.user_occupation    ?? '',
                organization: organizationState.organization,
                organization_other: organizationState.organization_other,
            });
            setEditing(false);
        }
    }, [learner?.user_id]);

    const usesOrganizationDropdown = usesOrganizationList(data.occupation, organizationSelectOccupations);

    if (!learner) return null;

    const completedSet = new Set(learner.completed_lesson_ids ?? []);
    const totalLessons = course?.sections?.reduce((sum, sec) => sum + (sec.lessons?.length ?? 0), 0) ?? 0;
    const completedCount = completedSet.size;
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : learner.progress;

    const occupationLabel = OCCUPATIONS.find(o => o.value === learner.user_occupation)?.label ?? learner.user_occupation;
    const raceLabel = RACES.find(r => r.value === learner.user_race)?.label ?? learner.user_race;

    function restoreForm() {
        const organizationState = splitOrganizationValue(
            learner.user_occupation ?? '',
            learner.user_organization ?? '',
            organizationOptions,
            organizationSelectOccupations,
        );

        reset();
        setData({
            name:         learner.user_name          ?? '',
            email:        learner.user_email         ?? '',
            gender:       learner.user_gender        ?? '',
            race:         learner.user_race          ?? '',
            state:        learner.user_state         ?? '',
            birthdate:    learner.user_birthdate_raw ?? '',
            occupation:   learner.user_occupation    ?? '',
            organization: organizationState.organization,
            organization_other: organizationState.organization_other,
        });
        setEditing(false);
    }

    function handleOccupationChange(value) {
        const currentOrganizationValue = usesOrganizationDropdown
            ? (data.organization === ORGANIZATION_OTHER_VALUE ? data.organization_other : data.organization)
            : data.organization;

        const nextOrganizationState = splitOrganizationValue(
            value,
            currentOrganizationValue,
            organizationOptions,
            organizationSelectOccupations,
        );

        setData(prev => ({
            ...prev,
            occupation: value,
            organization: nextOrganizationState.organization,
            organization_other: nextOrganizationState.organization_other,
        }));
    }

    function handleSave(e) {
        e.preventDefault();
        patch(route('admin.users.update-profile', learner.user_id), {
            onSuccess: () => setEditing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { restoreForm(); onClose(); } }}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{editing ? 'Edit Profile' : 'Learner Profile'}</DialogTitle>
                        {!editing && (
                            <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setEditing(true)}>
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        )}
                    </div>
                    <DialogDescription className="sr-only">
                        {editing ? 'Edit' : 'View'} profile for {learner.user_name}.
                    </DialogDescription>
                </DialogHeader>

                {editing ? (
                    <form onSubmit={handleSave} className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 py-1">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-medium">Full Name <span className="text-red-500">*</span></label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} />
                                <InputError message={errors.name} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-medium">Email Address <span className="text-red-500">*</span></label>
                                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                                <InputError message={errors.email} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium">Gender</label>
                            <div className="flex gap-2">
                                {[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setData('gender', data.gender === opt.value ? '' : opt.value)}
                                        className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all ${
                                            data.gender === opt.value
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <InputError message={errors.gender} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Race / Ethnicity</label>
                                <Select value={data.race} onValueChange={v => setData('race', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>
                                        {RACES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.race} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">State</label>
                                <Select value={data.state} onValueChange={v => setData('state', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                    <SelectContent>
                                        {MALAYSIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.state} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium">Date of Birth</label>
                            <Input
                                type="date"
                                value={data.birthdate}
                                onChange={e => setData('birthdate', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                            />
                            <InputError message={errors.birthdate} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium">Occupation</label>
                            <Select value={data.occupation} onValueChange={handleOccupationChange}>
                                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                <SelectContent>
                                    {OCCUPATIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.occupation} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium">Organization / Institution</label>
                            {usesOrganizationDropdown ? (
                                <div className="space-y-3">
                                    <SearchableSelect
                                        options={[
                                            ...organizationOptions,
                                            { value: ORGANIZATION_OTHER_VALUE, label: 'Other' },
                                        ]}
                                        value={data.organization}
                                        onChange={v => setData('organization', v)}
                                        placeholder="Select organization"
                                        searchPlaceholder="Search organizations..."
                                    />

                                    {data.organization === ORGANIZATION_OTHER_VALUE && (
                                        <Input
                                            value={data.organization_other}
                                            onChange={e => setData('organization_other', e.target.value)}
                                            placeholder="Enter organization / institution"
                                        />
                                    )}
                                </div>
                            ) : (
                                <Input
                                    value={data.organization}
                                    onChange={e => setData('organization', e.target.value)}
                                    placeholder="e.g. Universiti Malaya, Petronas…"
                                />
                            )}
                            <InputError message={errors.organization || errors.organization_other} />
                        </div>

                        <div className="flex gap-2 pt-2 sticky bottom-0 bg-background pb-1">
                            <Button type="submit" className="flex-1 gap-1.5" disabled={processing}>
                                <Save className="h-4 w-4" />
                                {processing ? 'Saving…' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="outline" onClick={restoreForm} disabled={processing}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="flex items-center gap-4 py-2">
                            <Avatar name={learner.user_name} src={learner.user_avatar} size="lg" />
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-base truncate">{learner.user_name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    {learner.user_email}
                                </p>
                            </div>
                            {learner.completed_at ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">Completed</Badge>
                            ) : (
                                <Badge variant="secondary" className="shrink-0">In Progress</Badge>
                            )}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-3 gap-3 text-center text-sm">
                            <div className="rounded-lg bg-muted/40 py-2.5 px-2">
                                <p className="text-lg font-bold">{progress}%</p>
                                <p className="text-xs text-muted-foreground">Progress</p>
                            </div>
                            <div className="rounded-lg bg-muted/40 py-2.5 px-2">
                                <p className="text-lg font-bold">{completedCount}</p>
                                <p className="text-xs text-muted-foreground">Lessons done</p>
                            </div>
                            <div className="rounded-lg bg-muted/40 py-2.5 px-2">
                                <p className="text-lg font-bold">{totalLessons}</p>
                                <p className="text-xs text-muted-foreground">Total lessons</p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Overall progress</span>
                                <span>{completedCount} / {totalLessons} lessons</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                Enrolled {learner.enrolled_at}
                            </span>
                            {learner.last_activity && (
                                <span className="flex items-center gap-1.5">
                                    <Activity className="h-3.5 w-3.5" />
                                    Last active {learner.last_activity}
                                </span>
                            )}
                            {learner.completed_at && (
                                <span className="flex items-center gap-1.5 text-green-600">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Completed {learner.completed_at}
                                </span>
                            )}
                            {learner.certificate_uuid && (
                                <Link
                                    href={`/certificate/${learner.certificate_uuid}`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 text-[#8B1A4A] hover:underline"
                                >
                                    <Award className="h-3.5 w-3.5" />
                                    View certificate
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            )}
                        </div>

                        <Separator />

                        {(occupationLabel || learner.user_organization || learner.user_state ||
                          learner.user_birthdate || learner.user_gender || raceLabel) && (
                            <>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                                    {learner.user_gender && (
                                        <div className="flex items-start gap-2">
                                            <User className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Gender</p>
                                                <p className="font-medium capitalize">{learner.user_gender}</p>
                                            </div>
                                        </div>
                                    )}
                                    {raceLabel && (
                                        <div className="flex items-start gap-2">
                                            <User className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Race / Ethnicity</p>
                                                <p className="font-medium">{raceLabel}</p>
                                            </div>
                                        </div>
                                    )}
                                    {learner.user_birthdate && (
                                        <div className="flex items-start gap-2">
                                            <CalendarDays className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Date of Birth</p>
                                                <p className="font-medium">{learner.user_birthdate}</p>
                                            </div>
                                        </div>
                                    )}
                                    {learner.user_state && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">State</p>
                                                <p className="font-medium">{learner.user_state}</p>
                                            </div>
                                        </div>
                                    )}
                                    {occupationLabel && (
                                        <div className="flex items-start gap-2">
                                            <Briefcase className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Occupation</p>
                                                <p className="font-medium">{occupationLabel}</p>
                                            </div>
                                        </div>
                                    )}
                                    {learner.user_organization && (
                                        <div className="flex items-start gap-2">
                                            <Building2 className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Organization</p>
                                                <p className="font-medium">{learner.user_organization}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Separator />
                            </>
                        )}

                        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
                            {course?.sections?.map(section => (
                                <div key={section.id}>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 sticky top-0 bg-background py-1">
                                        {section.title}
                                    </p>
                                    <div className="space-y-1">
                                        {section.lessons?.map(lesson => {
                                            const Icon = LESSON_ICONS[lesson.type] ?? FileText;
                                            const done = completedSet.has(lesson.id);
                                            return (
                                                <div
                                                    key={lesson.id}
                                                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                                                        done
                                                            ? 'bg-green-50 text-green-800'
                                                            : 'bg-muted/30 text-muted-foreground'
                                                    }`}
                                                >
                                                    {done
                                                        ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                                        : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                                                    }
                                                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                                    <span className={`flex-1 truncate ${done ? 'font-medium' : ''}`}>
                                                        {lesson.title}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

function LearnerRow({ learner, onViewProfile }) {
    return (
        <tr className="border-b transition-colors hover:bg-muted/30">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <Avatar name={learner.user_name} src={learner.user_avatar} />
                    <div>
                        <button
                            type="button"
                            onClick={() => onViewProfile(learner)}
                            className="text-sm font-medium hover:underline hover:text-primary text-left"
                        >
                            {learner.user_name}
                        </button>
                        <p className="text-xs text-muted-foreground">{learner.user_email}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{learner.enrolled_at}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2 min-w-[100px]">
                    <Progress value={learner.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground w-8 text-right">{learner.progress}%</span>
                </div>
            </td>
            <td className="px-4 py-3">
                {learner.completed_at ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-xs">{learner.completed_at}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">In progress</span>
                    </div>
                )}
            </td>
            <td className="px-4 py-3">
                {learner.certificate_uuid ? (
                    <Link
                        href={`/certificate/${learner.certificate_uuid}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-[#8B1A4A] hover:underline"
                    >
                        <Award className="h-3 w-3" />
                        View
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </td>
        </tr>
    );
}

function ucfirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function buildAnalyticsParams(filters) {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                params[key] = value;
            }

            return;
        }

        if (value !== '' && value !== null && value !== undefined) {
            params[key] = value;
        }
    });

    return params;
}

function buildAnalyticsQueryString(filters) {
    const params = new URLSearchParams();

    Object.entries(buildAnalyticsParams(filters)).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach(item => params.append(`${key}[]`, item));
            return;
        }

        params.append(key, value);
    });

    return params.toString();
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AnalyticsIndex({ courses, selectedCourse, analytics, filters: serverFilters }) {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        course_id:  serverFilters?.course_id  ?? courses[0]?.id ?? null,
        date_from:  serverFilters?.date_from  ?? thirtyDaysAgo,
        date_to:    serverFilters?.date_to    ?? today,
        gender:     serverFilters?.gender     ?? [],
        race:       serverFilters?.race       ?? [],
        state:      serverFilters?.state      ?? [],
        occupation: serverFilters?.occupation ?? [],
        age_group:  serverFilters?.age_group  ?? [],
    });
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('enrolled_at_raw');
    const [sortDir, setSortDir] = useState('desc');
    const [learnerStatusFilter, setLearnerStatusFilter] = useState('all');
    const [profileLearner, setProfileLearner] = useState(null);

    const learners = analytics?.learners ?? [];

    const completedCount = useMemo(
        () => learners.filter(l => !!l.completed_at).length,
        [learners],
    );

    const inProgressCount = useMemo(
        () => learners.filter(l => !l.completed_at).length,
        [learners],
    );

    const filteredLearners = useMemo(() => {
        let list = learners;

        if (learnerStatusFilter === 'completed') list = list.filter(l => !!l.completed_at);
        if (learnerStatusFilter === 'in_progress') list = list.filter(l => !l.completed_at);

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(l =>
                (l.user_name ?? '').toLowerCase().includes(q) ||
                (l.user_email ?? '').toLowerCase().includes(q),
            );
        }

        list = [...list].sort((a, b) => {
            const av = a[sortKey] ?? '';
            const bv = b[sortKey] ?? '';

            if (typeof av === 'number' && typeof bv === 'number') {
                return sortDir === 'asc' ? av - bv : bv - av;
            }

            return sortDir === 'asc'
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });

        return list;
    }, [learners, learnerStatusFilter, search, sortKey, sortDir]);

    function toggleSort(key) {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
            return;
        }

        setSortKey(key);
        setSortDir('asc');
    }

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleApply = useCallback(() => {
        const params = buildAnalyticsParams(filters);
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
            gender:     [],
            race:       [],
            state:      [],
            occupation: [],
            age_group:  [],
        };
        setFilters(reset);
        const params = buildAnalyticsParams(reset);
        router.get(route('admin.analytics.index'), params, { preserveState: true, replace: true });
    }, [filters.course_id]);

    const handleRemoveFilter = useCallback((key, value) => {
        const updated = {
            ...filters,
            [key]: (filters[key] ?? []).filter(item => item !== value),
        };
        setFilters(updated);
        const params = buildAnalyticsParams(updated);
        router.get(route('admin.analytics.index'), params, { preserveState: true, replace: true });
    }, [filters]);

    const handleExport = useCallback(() => {
        const qs = buildAnalyticsQueryString(filters);
        const url = `${route('admin.analytics.export')}${qs ? `?${qs}` : ''}`;
        window.location.href = url;
    }, [filters]);

    function SortIcon({ col }) {
        if (sortKey !== col) return null;
        return sortDir === 'asc'
            ? <ChevronUp className="h-3.5 w-3.5 inline ml-0.5" />
            : <ChevronDown className="h-3.5 w-3.5 inline ml-0.5" />;
    }

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

                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        Enrolled Learners
                                    </CardTitle>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex rounded-md border text-xs overflow-hidden">
                                            {[
                                                { key: 'all', label: `All (${learners.length})` },
                                                { key: 'in_progress', label: `In Progress (${inProgressCount})` },
                                                { key: 'completed', label: `Completed (${completedCount})` },
                                            ].map(({ key, label }) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setLearnerStatusFilter(key)}
                                                    className={`px-2.5 py-1.5 transition-colors ${
                                                        learnerStatusFilter === key
                                                            ? 'bg-foreground text-background'
                                                            : 'hover:bg-muted'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                            <Input
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                placeholder="Search learners…"
                                                className="pl-8 h-8 w-52 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {learners.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                        <Users className="h-10 w-10 text-muted-foreground mb-3" />
                                        <p className="text-muted-foreground">No learners match the selected filters.</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Try widening the date range or removing profile filters.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b bg-muted/30">
                                                    <th
                                                        className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                                                        onClick={() => toggleSort('user_name')}
                                                    >
                                                        Learner <SortIcon col="user_name" />
                                                    </th>
                                                    <th
                                                        className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                                                        onClick={() => toggleSort('enrolled_at_raw')}
                                                    >
                                                        Enrolled <SortIcon col="enrolled_at_raw" />
                                                    </th>
                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground min-w-[140px]">
                                                        Progress
                                                    </th>
                                                    <th
                                                        className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                                                        onClick={() => toggleSort('completed_at_raw')}
                                                    >
                                                        Status <SortIcon col="completed_at_raw" />
                                                    </th>
                                                    <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                                                        Certificate
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredLearners.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                                                            No learners match your search.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredLearners.map(learner => (
                                                        <LearnerRow
                                                            key={learner.id}
                                                            learner={learner}
                                                            onViewProfile={setProfileLearner}
                                                        />
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                        {filteredLearners.length > 0 && (
                                            <div className="px-4 py-2.5 text-xs text-muted-foreground border-t bg-muted/20">
                                                Showing {filteredLearners.length} of {learners.length} learner{learners.length !== 1 ? 's' : ''}.
                                                {' '}Click a name to view profile and lesson-level progress.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <LearnerProfileDialog
                            learner={profileLearner}
                            course={selectedCourse}
                            open={!!profileLearner}
                            onClose={() => setProfileLearner(null)}
                        />
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
