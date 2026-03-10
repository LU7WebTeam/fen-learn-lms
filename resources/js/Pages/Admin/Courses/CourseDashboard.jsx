import { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Users, GraduationCap, Award, TrendingUp, BookOpen,
    Search, ExternalLink, ChevronDown, ChevronUp, Video, FileText, HelpCircle,
    CheckCircle2, Clock, BarChart3, Mail, CalendarDays, Activity,
} from 'lucide-react';

const LESSON_ICONS = { video: Video, text: FileText, quiz: HelpCircle };

// ─── Metric card ──────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, color = 'text-foreground', bg = 'bg-muted/30' }) {
    return (
        <Card className={`${bg} border-0 shadow-sm`}>
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                        <p className={`text-3xl font-bold ${color}`}>{value}</p>
                        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                    </div>
                    <div className={`rounded-lg p-2.5 ${bg}`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, src, size = 'md' }) {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';
    const sizeClass = size === 'lg'
        ? 'h-14 w-14 text-lg'
        : 'h-8 w-8 text-xs';
    return (
        <div className={`${sizeClass} rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center font-semibold text-indigo-700 shrink-0`}>
            {src
                ? <img src={src} alt={name} className="h-full w-full object-cover" />
                : <span>{initials}</span>
            }
        </div>
    );
}

// ─── Student profile dialog ────────────────────────────────────────────────────
function StudentProfileDialog({ student, course, open, onClose }) {
    if (!student) return null;

    const completedSet = new Set(student.completed_lesson_ids ?? []);

    const totalLessons = course?.sections?.reduce(
        (sum, sec) => sum + (sec.lessons?.length ?? 0), 0
    ) ?? 0;

    const completedCount = completedSet.size;
    const progress = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : student.progress;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Learner Profile</DialogTitle>
                </DialogHeader>

                {/* Profile header */}
                <div className="flex items-center gap-4 py-2">
                    <Avatar name={student.user_name} src={student.user_avatar} size="lg" />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-base truncate">{student.user_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {student.user_email}
                        </p>
                    </div>
                    {student.completed_at ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0">
                            Completed
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="shrink-0">In Progress</Badge>
                    )}
                </div>

                <Separator />

                {/* Stats row */}
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

                {/* Progress bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Overall progress</span>
                        <span>{completedCount} / {totalLessons} lessons</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Enrolled {student.enrolled_at}
                    </span>
                    {student.last_activity && (
                        <span className="flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5" />
                            Last active {student.last_activity}
                        </span>
                    )}
                    {student.completed_at && (
                        <span className="flex items-center gap-1.5 text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completed {student.completed_at}
                        </span>
                    )}
                    {student.certificate_uuid && (
                        <Link
                            href={`/certificate/${student.certificate_uuid}`}
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

                {/* Lesson list */}
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
            </DialogContent>
        </Dialog>
    );
}

// ─── Student row ──────────────────────────────────────────────────────────────
function StudentRow({ student, onViewProfile }) {
    return (
        <tr className="border-b transition-colors hover:bg-muted/30">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <Avatar name={student.user_name} src={student.user_avatar} />
                    <div>
                        <button
                            type="button"
                            onClick={() => onViewProfile(student)}
                            className="text-sm font-medium hover:underline hover:text-primary text-left"
                        >
                            {student.user_name}
                        </button>
                        <p className="text-xs text-muted-foreground">{student.user_email}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                {student.enrolled_at}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2 min-w-[100px]">
                    <Progress value={student.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground w-8 text-right">{student.progress}%</span>
                </div>
            </td>
            <td className="px-4 py-3">
                {student.completed_at ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-xs">{student.completed_at}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">In progress</span>
                    </div>
                )}
            </td>
            <td className="px-4 py-3">
                {student.certificate_uuid ? (
                    <Link
                        href={`/certificate/${student.certificate_uuid}`}
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

// ─── Lesson progress row ──────────────────────────────────────────────────────
function LessonProgressRow({ lesson, maxRate }) {
    const Icon = LESSON_ICONS[lesson.type] ?? FileText;
    const width = maxRate > 0 ? (lesson.completion_rate / maxRate) * 100 : 0;
    return (
        <tr className="border-b transition-colors hover:bg-muted/30">
            <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-sm">{lesson.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 pl-5">{lesson.section}</p>
            </td>
            <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${width}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                        {lesson.completion_rate}%
                    </span>
                </div>
            </td>
            <td className="px-4 py-2.5 text-sm text-muted-foreground text-right">
                {lesson.completed_count}
            </td>
        </tr>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CourseDashboard({ analytics, students, lessonStats, course }) {
    const [search, setSearch]               = useState('');
    const [sortKey, setSortKey]             = useState('enrolled_at');
    const [sortDir, setSortDir]             = useState('desc');
    const [showLessons, setShowLessons]     = useState(false);
    const [studentFilter, setStudentFilter] = useState('all');
    const [profileStudent, setProfileStudent] = useState(null);

    const {
        total_enrollments,
        completed_count,
        in_progress_count,
        completion_rate,
        avg_progress,
        total_lessons,
        cert_issued_count,
    } = analytics;

    // Sort + search + filter students
    const filtered = useMemo(() => {
        let list = students;

        if (studentFilter === 'completed') list = list.filter(s => s.completed_at);
        if (studentFilter === 'in_progress') list = list.filter(s => !s.completed_at);

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s =>
                s.user_name.toLowerCase().includes(q) ||
                s.user_email.toLowerCase().includes(q)
            );
        }

        list = [...list].sort((a, b) => {
            let av = a[sortKey] ?? '';
            let bv = b[sortKey] ?? '';
            if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
            return sortDir === 'asc'
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });

        return list;
    }, [students, search, sortKey, sortDir, studentFilter]);

    function toggleSort(key) {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    }

    function SortIcon({ col }) {
        if (sortKey !== col) return null;
        return sortDir === 'asc'
            ? <ChevronUp className="h-3.5 w-3.5 inline ml-0.5" />
            : <ChevronDown className="h-3.5 w-3.5 inline ml-0.5" />;
    }

    const maxRate = Math.max(...(lessonStats.map(l => l.completion_rate) || [0]), 0);

    return (
        <div className="space-y-6">

            {/* ── Key metrics ── */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
                <MetricCard
                    icon={Users}
                    label="Total Enrolled"
                    value={total_enrollments}
                    color="text-indigo-600"
                />
                <MetricCard
                    icon={GraduationCap}
                    label="Completed"
                    value={completed_count}
                    sub={`${completion_rate}% rate`}
                    color="text-green-600"
                />
                <MetricCard
                    icon={Clock}
                    label="In Progress"
                    value={in_progress_count}
                    color="text-amber-600"
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Avg Progress"
                    value={`${avg_progress}%`}
                    color="text-blue-600"
                />
                <MetricCard
                    icon={Award}
                    label="Certificates"
                    value={cert_issued_count}
                    color="text-[#8B1A4A]"
                />
                <MetricCard
                    icon={BookOpen}
                    label="Total Lessons"
                    value={total_lessons}
                    color="text-slate-600"
                />
            </div>

            {/* ── Completion progress bar ── */}
            {total_enrollments > 0 && (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold">Course Completion Overview</span>
                            <span className="text-sm text-muted-foreground">
                                {completed_count} of {total_enrollments} students completed
                            </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex">
                            <div
                                className="h-full bg-green-500 transition-all"
                                style={{ width: `${completion_rate}%` }}
                                title={`${completed_count} completed`}
                            />
                            <div
                                className="h-full bg-amber-400 transition-all"
                                style={{ width: `${total_enrollments > 0 ? (in_progress_count / total_enrollments) * 100 : 0}%` }}
                                title={`${in_progress_count} in progress`}
                            />
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                                Completed ({completion_rate}%)
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                                In Progress ({total_enrollments > 0 ? Math.round((in_progress_count / total_enrollments) * 100) : 0}%)
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ── Enrolled Students ── */}
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Enrolled Students
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Filter buttons */}
                            <div className="flex rounded-md border text-xs overflow-hidden">
                                {[
                                    { key: 'all', label: `All (${total_enrollments})` },
                                    { key: 'in_progress', label: `In Progress (${in_progress_count})` },
                                    { key: 'completed', label: `Completed (${completed_count})` },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setStudentFilter(key)}
                                        className={`px-2.5 py-1.5 transition-colors ${
                                            studentFilter === key
                                                ? 'bg-foreground text-background'
                                                : 'hover:bg-muted'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search students…"
                                    className="pl-8 h-8 w-48 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {total_enrollments === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <Users className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-muted-foreground">No students enrolled yet.</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Make sure the course is published so learners can find and enroll.
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
                                            Student <SortIcon col="user_name" />
                                        </th>
                                        <th
                                            className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground whitespace-nowrap"
                                            onClick={() => toggleSort('enrolled_at')}
                                        >
                                            Enrolled <SortIcon col="enrolled_at" />
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground min-w-[140px]">
                                            Progress
                                        </th>
                                        <th
                                            className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                                            onClick={() => toggleSort('completed_at')}
                                        >
                                            Status <SortIcon col="completed_at" />
                                        </th>
                                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                                            Certificate
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                                                No students match your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map(student => (
                                            <StudentRow
                                                key={student.id}
                                                student={student}
                                                onViewProfile={setProfileStudent}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {filtered.length > 0 && (
                                <div className="px-4 py-2.5 text-xs text-muted-foreground border-t bg-muted/20">
                                    Showing {filtered.length} of {total_enrollments} student{total_enrollments !== 1 ? 's' : ''} · Click a name to view details
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Lesson completion breakdown ── */}
            {lessonStats.length > 0 && (
                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                        <button
                            type="button"
                            className="flex items-center justify-between w-full text-left"
                            onClick={() => setShowLessons(l => !l)}
                        >
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                Lesson Completion Rates
                            </CardTitle>
                            {showLessons
                                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </button>
                    </CardHeader>

                    {showLessons && (
                        <CardContent className="p-0">
                            <p className="px-4 pb-3 text-xs text-muted-foreground">
                                Percentage of enrolled students who have completed each lesson.
                                Low rates may indicate difficult or unclear content.
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Lesson</th>
                                            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground min-w-[160px]">Completion</th>
                                            <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Students</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lessonStats.map(lesson => (
                                            <LessonProgressRow key={lesson.id} lesson={lesson} maxRate={maxRate} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* ── Student profile dialog ── */}
            <StudentProfileDialog
                student={profileStudent}
                course={course}
                open={!!profileStudent}
                onClose={() => setProfileStudent(null)}
            />

        </div>
    );
}
