import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import InputError from '@/Components/InputError';
import ImageUpload from '@/Components/ImageUpload';
import CertificateBuilder from './CertificateBuilder';
import CourseDashboard from './CourseDashboard';
import BlockNoteEditor from '@/Components/BlockNoteEditor';
import { useState } from 'react';
import {
    Loader2, Plus, Pencil, Trash2, GripVertical,
    Video, FileText, HelpCircle, ChevronDown, ChevronRight, Check,
    Award, BookOpen, Settings2, BarChart3, Users, LayoutTemplate
} from 'lucide-react';

const STATUS_VARIANTS = { draft: 'secondary', review: 'outline', published: 'default' };

const LESSON_ICONS = {
    video: Video,
    text:  FileText,
    quiz:  HelpCircle,
    pdf:   FileText,
};

function Field({ label, error, children, hint }) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <InputError message={error} />}
        </div>
    );
}

function CourseDetailsForm({ course }) {
    const { data, setData, post, processing, errors, isDirty } = useForm({
        _method:           'patch',
        title:             course.title,
        slug:              course.slug,
        description:       course.description ?? '',
        cover_image:       course.cover_image ?? '',
        cover_image_file:  null,
        cover_image_clear: false,
        category:          course.category ?? '',
        difficulty:        course.difficulty,
        status:            course.status,
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.courses.update', course.id), { forceFormData: true });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Title *" error={errors.title}>
                            <Input value={data.title} onChange={(e) => setData('title', e.target.value)} />
                        </Field>
                        <Field label="Slug" error={errors.slug} hint="Must be unique">
                            <Input value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
                        </Field>
                    </div>

                    <Field label="Description" error={errors.description}>
                        <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-3">
                        <Field label="Category" error={errors.category}>
                            <Input value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="e.g. Programming" />
                        </Field>
                        <Field label="Difficulty *" error={errors.difficulty}>
                            <Select value={data.difficulty} onValueChange={(v) => setData('difficulty', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="beginner">Beginner</SelectItem>
                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                    <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field label="Status" error={errors.status}>
                            <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="review">In Review</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <Field label="Cover Image" error={errors.cover_image || errors.cover_image_file}>
                        <ImageUpload
                            value={data.cover_image}
                            onFileChange={(file) => {
                                setData('cover_image_file', file);
                                setData('cover_image_clear', false);
                            }}
                            onClear={() => {
                                setData('cover_image', '');
                                setData('cover_image_file', null);
                                setData('cover_image_clear', true);
                            }}
                        />
                    </Field>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing || !isDirty}>
                            {processing
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                                : <><Check className="mr-2 h-4 w-4" />Save Details</>}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function AddLessonForm({ section, onDone }) {
    const { data, setData, post, processing, reset } = useForm({ title: '', type: 'video' });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.sections.lessons.store', section.id), {
            onSuccess: () => { reset(); onDone?.(); },
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 pl-6 pt-2">
            <Input
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Lesson title"
                className="h-8 text-sm"
                autoFocus
            />
            <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                <SelectTrigger className="h-8 w-28 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
            </Select>
            <Button type="submit" size="sm" disabled={processing || !data.title.trim()}>
                {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Add'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onDone?.()}>
                Cancel
            </Button>
        </form>
    );
}

function LessonRow({ lesson }) {
    const Icon = LESSON_ICONS[lesson.type] ?? FileText;

    function handleDelete() {
        if (!window.confirm(`Delete lesson "${lesson.title}"?`)) return;
        router.delete(route('admin.lessons.destroy', lesson.id));
    }

    return (
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 group">
            <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-sm truncate">{lesson.title}</span>
            <Badge variant="outline" className="text-xs capitalize shrink-0">{lesson.type}</Badge>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                    <Link href={route('admin.lessons.edit', lesson.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

function SectionCard({ section }) {
    const [expanded, setExpanded]           = useState(true);
    const [addingLesson, setAddingLesson]   = useState(false);
    const [renaming, setRenaming]           = useState(false);
    const [title, setTitle]                 = useState(section.title);

    function handleRename(e) {
        e.preventDefault();
        router.patch(route('admin.sections.update', section.id), { title }, {
            onSuccess: () => setRenaming(false),
        });
    }

    function handleDelete() {
        if (!window.confirm(`Delete section "${section.title}" and all its lessons?`)) return;
        router.delete(route('admin.sections.destroy', section.id));
    }

    return (
        <Card>
            <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="flex items-center gap-1 flex-1 text-left"
                    >
                        {expanded
                            ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                        {renaming ? (
                            <form onSubmit={handleRename} className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-7 text-sm"
                                    autoFocus
                                    onBlur={handleRename}
                                />
                            </form>
                        ) : (
                            <span className="font-medium text-sm">{section.title}</span>
                        )}
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-muted-foreground">{section.lessons.length} lessons</span>
                        <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => { setRenaming(!renaming); setTitle(section.title); }}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {expanded && (
                <CardContent className="px-4 pb-3 pt-0">
                    {section.lessons.length > 0 && (
                        <div className="mb-2 space-y-0.5">
                            {section.lessons.map((lesson) => (
                                <LessonRow key={lesson.id} lesson={lesson} />
                            ))}
                        </div>
                    )}

                    {addingLesson ? (
                        <AddLessonForm section={section} onDone={() => setAddingLesson(false)} />
                    ) : (
                        <Button
                            variant="ghost" size="sm"
                            className="ml-6 text-muted-foreground hover:text-foreground"
                            onClick={() => setAddingLesson(true)}
                        >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Add Lesson
                        </Button>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

function AddSectionForm({ course, onDone }) {
    const { data, setData, post, processing, reset } = useForm({ title: '' });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.courses.sections.store', course.id), {
            onSuccess: () => { reset(); onDone?.(); },
        });
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Section title, e.g. Getting Started"
                autoFocus
            />
            <Button type="submit" disabled={processing || !data.title.trim()}>
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Section
            </Button>
            <Button type="button" variant="ghost" onClick={() => onDone?.()}>
                Cancel
            </Button>
        </form>
    );
}

function CourseIntroductionForm({ course }) {
    const [content, setContent] = useState(
        Array.isArray(course.introduction) && course.introduction.length > 0
            ? course.introduction
            : null
    );
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);

    function handleSave() {
        setSaving(true);
        router.patch(
            route('admin.courses.introduction.update', course.id),
            { introduction: content },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaving(false);
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2500);
                },
                onError: () => setSaving(false),
            }
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">Course Introduction</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    This is shown on the public course page — use it as a mini landing page with images, video links, headings, and rich text.
                    Learners and visitors see it before enrolling.
                </p>
            </div>

            <div className="rounded-xl border overflow-hidden">
                <BlockNoteEditor
                    key={course.id}
                    initialContent={content}
                    onChange={setContent}
                />
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    Supported: headings, paragraphs, lists, images, videos, tables, dividers, and more.
                </p>
                <Button onClick={handleSave} disabled={saving}>
                    {saved
                        ? <><Check className="mr-2 h-4 w-4" />Saved!</>
                        : saving
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                            : 'Save Introduction'}
                </Button>
            </div>
        </div>
    );
}

export default function EditCourse({ course, flash, defaultTemplate, analytics, students, lessonStats }) {
    const [addingSection, setAddingSection] = useState(false);

    return (
        <AdminLayout title={`Edit: ${course.title}`}>
            <Head title={`Edit ${course.title} — Admin`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Link href={route('admin.courses.index')} className="hover:underline">Courses</Link>
                            <span>/</span>
                            <span>Edit</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">{course.title}</h2>
                    </div>
                    <Badge variant={STATUS_VARIANTS[course.status] || 'secondary'} className="capitalize text-sm">
                        {course.status}
                    </Badge>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800 border border-green-200">
                        {flash.success}
                    </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue="details">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="details" className="gap-2">
                            <Settings2 className="h-4 w-4" />Details
                        </TabsTrigger>
                        <TabsTrigger value="curriculum" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Curriculum
                            <Badge variant="secondary" className="ml-1 text-xs">
                                {course.sections.reduce((t, s) => t + s.lessons.length, 0)}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="certificate" className="gap-2">
                            <Award className="h-4 w-4" />Certificate
                            {course.certificate_template?.enabled === false && (
                                <Badge variant="outline" className="ml-1 text-xs text-muted-foreground">Off</Badge>
                            )}
                            {course.certificate_template?.enabled && (
                                <Badge variant="secondary" className="ml-1 text-xs text-green-700 bg-green-50">On</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="dashboard" className="gap-2">
                            <BarChart3 className="h-4 w-4" />Dashboard
                            {analytics?.total_enrollments > 0 && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    <Users className="h-2.5 w-2.5 mr-0.5 inline" />
                                    {analytics.total_enrollments}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="introduction" className="gap-2">
                            <LayoutTemplate className="h-4 w-4" />Introduction
                            {Array.isArray(course.introduction) && course.introduction.length > 0 && (
                                <Badge variant="secondary" className="ml-1 text-xs text-green-700 bg-green-50">Live</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Details tab ── */}
                    <TabsContent value="details" className="mt-6">
                        <CourseDetailsForm course={course} />
                    </TabsContent>

                    {/* ── Curriculum tab ── */}
                    <TabsContent value="curriculum" className="mt-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Curriculum</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {course.sections.length} section{course.sections.length !== 1 ? 's' : ''} · {' '}
                                        {course.sections.reduce((t, s) => t + s.lessons.length, 0)} lessons
                                    </p>
                                </div>
                                {!addingSection && (
                                    <Button variant="outline" onClick={() => setAddingSection(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Section
                                    </Button>
                                )}
                            </div>

                            {addingSection && (
                                <AddSectionForm course={course} onDone={() => setAddingSection(false)} />
                            )}

                            {course.sections.length === 0 && !addingSection ? (
                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                                    <p className="mb-4 text-muted-foreground">
                                        No sections yet. Add the first section to start building your curriculum.
                                    </p>
                                    <Button onClick={() => setAddingSection(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Section
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {course.sections.map((section) => (
                                        <SectionCard key={section.id} section={section} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ── Certificate tab ── */}
                    <TabsContent value="certificate" className="mt-6">
                        <CertificateBuilder
                            course={course}
                            defaultTemplate={defaultTemplate}
                            sections={course.sections}
                        />
                    </TabsContent>

                    {/* ── Dashboard tab ── */}
                    <TabsContent value="dashboard" className="mt-6">
                        <CourseDashboard
                            analytics={analytics}
                            students={students}
                            lessonStats={lessonStats}
                        />
                    </TabsContent>

                    {/* ── Introduction tab ── */}
                    <TabsContent value="introduction" className="mt-6">
                        <CourseIntroductionForm course={course} />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
