import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
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
} from 'lucide-react';

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

function StudentRow({ user, onChangeRole }) {
    return (
        <tr className="border-b transition-colors hover:bg-muted/30">
            <td className="py-3 pl-4 pr-3">
                <div>
                    <p className="font-medium text-sm">{user.name}</p>
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
                <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => onChangeRole(user)}>
                    <UserCog className="h-3.5 w-3.5" />
                    Change Role
                </Button>
            </td>
        </tr>
    );
}

function StaffRow({ user, onChangeRole, currentUserId }) {
    const isSelf = user.id === currentUserId;
    return (
        <tr className="border-b transition-colors hover:bg-muted/30">
            <td className="py-3 pl-4 pr-3">
                <div className="flex items-center gap-2">
                    <div>
                        <p className="font-medium text-sm">
                            {user.name}
                            {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>}
                        </p>
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
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    disabled={isSelf}
                    onClick={() => !isSelf && onChangeRole(user)}
                >
                    <UserCog className="h-3.5 w-3.5" />
                    Change Role
                </Button>
            </td>
        </tr>
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
                <div className="grid grid-cols-3 gap-4">
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
        </AdminLayout>
    );
}
