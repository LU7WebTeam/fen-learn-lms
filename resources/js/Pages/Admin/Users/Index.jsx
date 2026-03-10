import { useState, useEffect } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Progress } from '@/Components/ui/progress';
import { Separator } from '@/Components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import InputError from '@/Components/InputError';
import {
    Users,
    ShieldCheck,
    GraduationCap,
    Search,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    UserCog,
    Crown,
    Pencil,
    UserPlus,
    Mail,
    Send,
    Ban,
    CircleCheck,
    Save,
    X,
    CalendarDays,
    MapPin,
    Briefcase,
    Building2,
    Activity,
    Award,
    ExternalLink,
    User,
    Clock,
} from 'lucide-react';

const MALAYSIAN_STATES = [
    'Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Perak',
    'Perlis','Pulau Pinang','Sabah','Sarawak','Selangor','Terengganu',
    'Wilayah Persekutuan Kuala Lumpur','Wilayah Persekutuan Labuan',
    'Wilayah Persekutuan Putrajaya',
];
const OCCUPATIONS = [
    { value: 'student',       label: 'Student' },
    { value: 'government',    label: 'Government Employee' },
    { value: 'private',       label: 'Private Sector Employee' },
    { value: 'self_employed', label: 'Self-employed / Entrepreneur' },
    { value: 'professional',  label: 'Professional (Doctor, Lawyer, etc.)' },
    { value: 'academic',      label: 'Academic / Educator' },
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

function UserAvatar({ name, src, size = 'md' }) {
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

// ─── Learner profile dialog ───────────────────────────────────────────────────
function LearnerProfileDialog({ userId, open, onClose }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
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
    });

    useEffect(() => {
        if (!open || !userId) return;
        setLoading(true);
        setEditing(false);
        fetch(route('admin.users.show', userId), { headers: { 'Accept': 'application/json' } })
            .then(r => r.json())
            .then(data => {
                setProfile(data);
                setData({
                    name:         data.name         ?? '',
                    email:        data.email        ?? '',
                    gender:       data.gender       ?? '',
                    race:         data.race         ?? '',
                    state:        data.state        ?? '',
                    birthdate:    data.birthdate_raw ?? '',
                    occupation:   data.occupation   ?? '',
                    organization: data.organization ?? '',
                });
            })
            .finally(() => setLoading(false));
    }, [open, userId]);

    function restoreForm() {
        if (!profile) return;
        reset();
        setData({
            name:         profile.name         ?? '',
            email:        profile.email        ?? '',
            gender:       profile.gender       ?? '',
            race:         profile.race         ?? '',
            state:        profile.state        ?? '',
            birthdate:    profile.birthdate_raw ?? '',
            occupation:   profile.occupation   ?? '',
            organization: profile.organization ?? '',
        });
        setEditing(false);
    }

    function handleSave(e) {
        e.preventDefault();
        patch(route('admin.users.update-profile', userId), {
            onSuccess: () => {
                setProfile(prev => ({
                    ...prev,
                    name:         data.name,
                    email:        data.email,
                    gender:       data.gender,
                    race:         data.race,
                    state:        data.state,
                    occupation:   data.occupation,
                    organization: data.organization,
                }));
                setEditing(false);
            },
        });
    }

    const occupationLabel = OCCUPATIONS.find(o => o.value === profile?.occupation)?.label ?? profile?.occupation;
    const raceLabel       = RACES.find(r => r.value === profile?.race)?.label ?? profile?.race;

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) { restoreForm(); onClose(); } }}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{editing ? 'Edit Profile' : 'Learner Profile'}</DialogTitle>
                        {!editing && profile && (
                            <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setEditing(true)}>
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        )}
                    </div>
                    <DialogDescription className="sr-only">
                        {editing ? 'Edit' : 'View'} profile for learner.
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                        Loading…
                    </div>
                )}

                {!loading && profile && editing && (
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
                            <Select value={data.occupation} onValueChange={v => setData('occupation', v)}>
                                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                                <SelectContent>
                                    {OCCUPATIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.occupation} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium">Organization / Institution</label>
                            <Input
                                value={data.organization}
                                onChange={e => setData('organization', e.target.value)}
                                placeholder="e.g. Universiti Malaya, Petronas…"
                            />
                            <InputError message={errors.organization} />
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
                )}

                {!loading && profile && !editing && (
                    <>
                        {/* Profile header */}
                        <div className="flex items-center gap-4 py-2">
                            <UserAvatar name={profile.name} src={profile.avatar} size="lg" />
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-base truncate">{profile.name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                                    <Mail className="h-3.5 w-3.5 shrink-0" />
                                    {profile.email}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Joined {profile.created_at}
                                </p>
                            </div>
                            {profile.suspended_at ? (
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600">
                                    <Ban className="h-3 w-3" /> Suspended
                                </span>
                            ) : (
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-sky-100 border border-sky-200 px-2.5 py-0.5 text-xs font-medium text-sky-600">
                                    <GraduationCap className="h-3 w-3" /> Student
                                </span>
                            )}
                        </div>

                        <Separator />

                        {/* Profile info grid */}
                        {(profile.gender || raceLabel || profile.birthdate || profile.state || occupationLabel || profile.organization) && (
                            <>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                                    {profile.gender && (
                                        <div className="flex items-start gap-2">
                                            <User className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Gender</p>
                                                <p className="font-medium capitalize">{profile.gender}</p>
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
                                    {profile.birthdate && (
                                        <div className="flex items-start gap-2">
                                            <CalendarDays className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Date of Birth</p>
                                                <p className="font-medium">{profile.birthdate}</p>
                                            </div>
                                        </div>
                                    )}
                                    {profile.state && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">State</p>
                                                <p className="font-medium">{profile.state}</p>
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
                                    {profile.organization && (
                                        <div className="flex items-start gap-2">
                                            <Building2 className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Organization</p>
                                                <p className="font-medium">{profile.organization}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Enrolled courses */}
                        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                Enrolled Courses ({profile.enrollments.length})
                            </p>
                            {profile.enrollments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <BookOpen className="h-8 w-8 text-muted-foreground/40 mb-2" />
                                    <p className="text-sm text-muted-foreground">Not enrolled in any courses yet.</p>
                                </div>
                            ) : (
                                profile.enrollments.map(enrollment => (
                                    <div key={enrollment.id} className="rounded-lg border bg-muted/20 p-3 space-y-2">
                                        <div className="flex items-start gap-3">
                                            {enrollment.course_thumbnail ? (
                                                <img
                                                    src={enrollment.course_thumbnail}
                                                    alt={enrollment.course_title}
                                                    className="h-10 w-16 rounded object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="h-10 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                                                    <BookOpen className="h-4 w-4 text-muted-foreground/50" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{enrollment.course_title}</p>
                                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="h-3 w-3" />
                                                        Enrolled {enrollment.enrolled_at}
                                                    </span>
                                                    {enrollment.completed_at ? (
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Completed {enrollment.completed_at}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            In progress
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {enrollment.certificate_uuid && (
                                                <a
                                                    href={`/certificate/${enrollment.certificate_uuid}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="shrink-0 inline-flex items-center gap-1 text-xs text-[#8B1A4A] hover:underline"
                                                >
                                                    <Award className="h-3 w-3" />
                                                    Cert
                                                    <ExternalLink className="h-2.5 w-2.5" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Progress</span>
                                                <span>{enrollment.completed_count} / {enrollment.total_lessons} lessons</span>
                                            </div>
                                            <Progress value={enrollment.progress} className="h-1.5" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

const ROLE_META = {
    super_admin:    { label: 'Super Admin',    color: 'bg-rose-100 text-rose-700 border-rose-200',   icon: Crown  },
    content_editor: { label: 'Content Editor', color: 'bg-violet-100 text-violet-700 border-violet-200', icon: Pencil },
    learner:        { label: 'Student',         color: 'bg-sky-100 text-sky-700 border-sky-200',       icon: GraduationCap },
};

function RoleBadge({ role }) {
    const meta = ROLE_META[role] ?? { label: role, color: 'bg-muted text-muted-foreground border-border', icon: Users };
    const Icon = meta.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
            <Icon className="h-3 w-3" />
            {meta.label}
        </span>
    );
}

function ChangeRoleDialog({ user, open, onClose, currentUserId }) {
    const [role, setRole] = useState(user?.role ?? 'learner');
    const [processing, setProcessing] = useState(false);

    function handleConfirm() {
        if (role === user.role) { onClose(); return; }
        setProcessing(true);
        router.patch(route('admin.users.update-role', user.id), { role }, {
            onFinish: () => { setProcessing(false); onClose(); },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Change Role</DialogTitle>
                    <DialogDescription>
                        Update the role for <strong>{user?.name}</strong>. This changes what they can access immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{user?.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <div className="ml-auto shrink-0">
                            <RoleBadge role={user?.role} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">New role</label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="learner">
                                    <span className="flex items-center gap-2">
                                        <GraduationCap className="h-3.5 w-3.5 text-sky-600" />
                                        Student (learner)
                                    </span>
                                </SelectItem>
                                <SelectItem value="content_editor">
                                    <span className="flex items-center gap-2">
                                        <Pencil className="h-3.5 w-3.5 text-violet-600" />
                                        Content Editor
                                    </span>
                                </SelectItem>
                                <SelectItem value="super_admin">
                                    <span className="flex items-center gap-2">
                                        <Crown className="h-3.5 w-3.5 text-rose-600" />
                                        Super Admin
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {user?.id === currentUserId && (
                        <p className="text-xs text-destructive">You cannot change your own role.</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={processing || role === user?.role || user?.id === currentUserId}
                    >
                        {processing ? 'Saving…' : 'Change Role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Pagination({ data, pageName }) {
    if (data.last_page <= 1) return null;

    function goTo(page) {
        router.get(route('admin.users.index'), { [pageName]: page }, { preserveState: true, preserveScroll: true });
    }

    return (
        <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
                Showing {data.from}–{data.to} of {data.total}
            </p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!data.prev_page_url} onClick={() => goTo(data.current_page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center px-2 text-sm">
                    {data.current_page} / {data.last_page}
                </span>
                <Button variant="outline" size="sm" disabled={!data.next_page_url} onClick={() => goTo(data.current_page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function SuspendedBadge() {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-medium text-red-600">
            <Ban className="h-3 w-3" /> Suspended
        </span>
    );
}

function StudentRow({ user, onChangeRole, onSuspend, onUnsuspend, onViewProfile }) {
    const isSuspended = !!user.suspended_at;
    return (
        <tr className={`border-b transition-colors hover:bg-muted/30 ${isSuspended ? 'opacity-60' : ''}`}>
            <td className="py-3 pl-4 pr-3">
                <div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="font-medium text-sm hover:underline hover:text-primary text-left"
                            onClick={() => onViewProfile(user.id)}
                        >
                            {user.name}
                        </button>
                        {isSuspended && <SuspendedBadge />}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
            </td>
            <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </td>
            <td className="px-3 py-3">
                <div className="flex items-center gap-1.5 text-sm">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{user.enrollments_count}</span>
                    {user.enrollments_count > 0 && (
                        <>
                            <span className="text-muted-foreground">·</span>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-600">{user.completed_enrollments_count}</span>
                        </>
                    )}
                </div>
            </td>
            <td className="px-3 py-3">
                <RoleBadge role={user.role} />
            </td>
            <td className="py-3 pl-3 pr-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => onChangeRole(user)}>
                        <UserCog className="h-3.5 w-3.5" />
                        Role
                    </Button>
                    {isSuspended ? (
                        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700" onClick={() => onUnsuspend(user)}>
                            <CircleCheck className="h-3.5 w-3.5" />
                            Reinstate
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={() => onSuspend(user)}>
                            <Ban className="h-3.5 w-3.5" />
                            Suspend
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}

function StaffRow({ user, onChangeRole, onSuspend, onUnsuspend, currentUserId }) {
    const isSelf = user.id === currentUserId;
    const isSuspended = !!user.suspended_at;
    return (
        <tr className={`border-b transition-colors hover:bg-muted/30 ${isSuspended ? 'opacity-60' : ''}`}>
            <td className="py-3 pl-4 pr-3">
                <div className="flex items-center gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">
                                {user.name}
                                {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                            </p>
                            {isSuspended && <SuspendedBadge />}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-3 py-3">
                <RoleBadge role={user.role} />
            </td>
            <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </td>
            <td className="py-3 pl-3 pr-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        disabled={isSelf}
                        onClick={() => !isSelf && onChangeRole(user)}
                    >
                        <UserCog className="h-3.5 w-3.5" />
                        Role
                    </Button>
                    {!isSelf && (
                        isSuspended ? (
                            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700" onClick={() => onUnsuspend(user)}>
                                <CircleCheck className="h-3.5 w-3.5" />
                                Reinstate
                            </Button>
                        ) : (
                            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive" onClick={() => onSuspend(user)}>
                                <Ban className="h-3.5 w-3.5" />
                                Suspend
                            </Button>
                        )
                    )}
                </div>
            </td>
        </tr>
    );
}

function SuspendDialog({ user, open, onClose }) {
    const { data, setData, patch, processing, reset } = useForm({ reason: '' });

    function handleSubmit(e) {
        e.preventDefault();
        patch(route('admin.users.suspend', user.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    function handleClose() { reset(); onClose(); }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <Ban className="h-4 w-4" /> Suspend Account
                    </DialogTitle>
                    <DialogDescription>
                        <strong>{user?.name}</strong> will be immediately logged out and blocked from signing in.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Reason <span className="text-muted-foreground font-normal">(optional)</span></label>
                        <textarea
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            rows={3}
                            maxLength={500}
                            placeholder="Provide a reason for the suspension…"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>Cancel</Button>
                        <Button type="submit" variant="destructive" disabled={processing}>
                            {processing ? 'Suspending…' : 'Suspend Account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function InviteStaffDialog({ open, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role:  'content_editor',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.invitations.store'), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    function handleClose() {
        reset();
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" /> Invite Staff Member
                    </DialogTitle>
                    <DialogDescription>
                        Send an email invitation to add a new content editor or super admin.
                        The link expires in 7 days.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium" htmlFor="invite-email">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="invite-email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="colleague@example.com"
                                className="pl-9"
                                autoFocus
                            />
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Role to assign</label>
                        <Select value={data.role} onValueChange={v => setData('role', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="content_editor">
                                    <span className="flex items-center gap-2">
                                        <Pencil className="h-3.5 w-3.5 text-violet-600" />
                                        Content Editor
                                    </span>
                                </SelectItem>
                                <SelectItem value="super_admin">
                                    <span className="flex items-center gap-2">
                                        <Crown className="h-3.5 w-3.5 text-rose-600" />
                                        Super Admin
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="gap-1.5">
                            <Send className="h-3.5 w-3.5" />
                            {processing ? 'Sending…' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function UsersIndex({ staff, students, counts, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [dialogUser, setDialogUser] = useState(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [suspendUser, setSuspendUser] = useState(null);
    const [profileUserId, setProfileUserId] = useState(null);

    function handleUnsuspend(user) {
        if (!window.confirm(`Reinstate ${user.name}'s account?`)) return;
        router.patch(route('admin.users.unsuspend', user.id));
    }

    function handleSearch(e) {
        e.preventDefault();
        router.get(route('admin.users.index'), { search }, { preserveState: true });
    }

    function clearSearch() {
        setSearch('');
        router.get(route('admin.users.index'), {}, { preserveState: true });
    }

    const flash = usePage().props.flash ?? {};

    return (
        <AdminLayout title="User Management">
            <div className="space-y-6">

                {/* Flash messages */}
                {flash.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {flash.success}
                    </div>
                )}
                {flash.error && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage students, content editors, and administrators.
                        </p>
                    </div>

                    {/* Search + Invite */}
                    <div className="flex gap-2 flex-wrap">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search name or email…"
                                    className="pl-9 w-64"
                                />
                            </div>
                            <Button type="submit" variant="secondary" size="sm">Search</Button>
                            {filters.search && (
                                <Button type="button" variant="ghost" size="sm" onClick={clearSearch}>Clear</Button>
                            )}
                        </form>
                        <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
                            <UserPlus className="h-4 w-4" />
                            Invite Staff
                        </Button>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
                        <div className="rounded-lg bg-sky-100 p-2.5 dark:bg-sky-900/30">
                            <GraduationCap className="h-5 w-5 text-sky-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{counts.students.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
                        <div className="rounded-lg bg-violet-100 p-2.5 dark:bg-violet-900/30">
                            <Pencil className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{counts.editors.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Content Editors</p>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
                        <div className="rounded-lg bg-rose-100 p-2.5 dark:bg-rose-900/30">
                            <Crown className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{counts.super_admins.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Super Admins</p>
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
                        <div className="rounded-lg bg-red-100 p-2.5 dark:bg-red-900/30">
                            <Ban className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{counts.suspended.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Suspended</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="students">
                    <TabsList>
                        <TabsTrigger value="students" className="gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Students
                            <Badge variant="secondary" className="ml-1 text-xs">{students.total}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="staff" className="gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            Staff &amp; Admins
                            <Badge variant="secondary" className="ml-1 text-xs">{staff.total}</Badge>
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Students ── */}
                    <TabsContent value="students" className="mt-4">
                        <div className="rounded-xl border bg-card">
                            {students.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <GraduationCap className="h-10 w-10 text-muted-foreground/40 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground">No students found</p>
                                    {filters.search && (
                                        <p className="text-xs text-muted-foreground mt-1">Try a different search term.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                <th className="py-2.5 pl-4 pr-3">Student</th>
                                                <th className="px-3 py-2.5">Joined</th>
                                                <th className="px-3 py-2.5">Courses</th>
                                                <th className="px-3 py-2.5">Role</th>
                                                <th className="py-2.5 pl-3 pr-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.data.map(user => (
                                                <StudentRow
                                                    key={user.id}
                                                    user={user}
                                                    onChangeRole={setDialogUser}
                                                    onSuspend={setSuspendUser}
                                                    onUnsuspend={handleUnsuspend}
                                                    onViewProfile={setProfileUserId}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {students.data.length > 0 && (
                                <div className="p-4">
                                    <Pagination data={students} pageName="students_page" />
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ── Staff ── */}
                    <TabsContent value="staff" className="mt-4">
                        <div className="rounded-xl border bg-card">
                            {staff.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mb-3" />
                                    <p className="text-sm font-medium text-muted-foreground">No staff found</p>
                                    {filters.search && (
                                        <p className="text-xs text-muted-foreground mt-1">Try a different search term.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                <th className="py-2.5 pl-4 pr-3">Staff Member</th>
                                                <th className="px-3 py-2.5">Role</th>
                                                <th className="px-3 py-2.5">Joined</th>
                                                <th className="py-2.5 pl-3 pr-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staff.data.map(user => (
                                                <StaffRow
                                                    key={user.id}
                                                    user={user}
                                                    onChangeRole={setDialogUser}
                                                    onSuspend={setSuspendUser}
                                                    onUnsuspend={handleUnsuspend}
                                                    currentUserId={auth.user.id}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {staff.data.length > 0 && (
                                <div className="p-4">
                                    <Pagination data={staff} pageName="staff_page" />
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Suspend Dialog */}
            <SuspendDialog
                user={suspendUser}
                open={!!suspendUser}
                onClose={() => setSuspendUser(null)}
            />

            {/* Role Change Dialog */}
            {dialogUser && (
                <ChangeRoleDialog
                    user={dialogUser}
                    open={!!dialogUser}
                    onClose={() => setDialogUser(null)}
                    currentUserId={auth.user.id}
                />
            )}

            {/* Invite Staff Dialog */}
            <InviteStaffDialog
                open={inviteOpen}
                onClose={() => setInviteOpen(false)}
            />

            {/* Learner Profile Dialog */}
            <LearnerProfileDialog
                userId={profileUserId}
                open={!!profileUserId}
                onClose={() => setProfileUserId(null)}
            />
        </AdminLayout>
    );
}
