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
import { useState, useEffect } from 'react';
import {
    Loader2, Plus, Pencil, Trash2, GripVertical, Copy,
    Video, FileText, HelpCircle, ChevronDown, ChevronRight, Check,
    Award, BookOpen, Settings2, BarChart3, Users, LayoutTemplate, ScrollText
} from 'lucide-react';

const STATUS_VARIANTS = { draft: 'secondary', review: 'outline', published: 'default' };

function LangTab({ lang, setLang }) {
    return (
        <div className="flex items-center gap-1 rounded-md border bg-muted/50 p-0.5 w-fit">
            <button type="button" onClick={() => setLang('en')} className={['rounded px-2.5 py-0.5 text-xs font-medium transition-colors', lang === 'en' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}>EN</button>
            <button type="button" onClick={() => setLang('ms')} className={['rounded px-2.5 py-0.5 text-xs font-medium transition-colors', lang === 'ms' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}>BM</button>
        </div>
    );
}

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

const ACTIVITY_EVENT_LABELS = {
    enrollment_started: 'Enrollment Started',
    lesson_completed: 'Lesson Completed',
    quiz_attempt_submitted: 'Quiz Attempt Submitted',
    quiz_passed: 'Quiz Passed',
    quiz_failed: 'Quiz Failed',
    course_completed: 'Course Completed',
};

function LearnerActivityPanel({ activities = [], students = [] }) {
    const [learnerId, setLearnerId] = useState('all');
    const [eventFilter, setEventFilter] = useState('all');

    const eventOptions = [...new Set(activities.map((item) => item.event).filter(Boolean))];

    const visible = activities.filter((item) => {
        if (learnerId !== 'all' && String(item.learner?.id ?? '') !== learnerId) {
            return false;
        }

        if (eventFilter !== 'all' && item.event !== eventFilter) {
            return false;
        }

        return true;
    });

    function renderResult(item) {
        const hasScore = item.properties?.percentage !== null && item.properties?.percentage !== undefined;
        const hasPassed = typeof item.properties?.passed === 'boolean';

        if (!hasScore && !hasPassed) {
            return '-';
        }

        if (hasScore && hasPassed) {
            return `${item.properties.percentage}% (${item.properties.passed ? 'Passed' : 'Failed'})`;
        }

        if (hasScore) {
            return `${item.properties.percentage}%`;
        }

        return item.properties.passed ? 'Passed' : 'Failed';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4" />
                    Learner Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label>Filter by Learner</Label>
                        <Select value={learnerId} onValueChange={setLearnerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="All learners" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All learners</SelectItem>
                                {students.map((student) => (
                                    <SelectItem key={student.user_id} value={String(student.user_id)}>
                                        {student.user_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Filter by Event</Label>
                        <Select value={eventFilter} onValueChange={setEventFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All events" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All events</SelectItem>
                                {eventOptions.map((event) => (
                                    <SelectItem key={event} value={event}>
                                        {ACTIVITY_EVENT_LABELS[event] ?? event}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {visible.length === 0 ? (
                    <div className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                        No learner activity events for this filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead className="bg-muted/40 text-left">
                                <tr>
                                    <th className="px-3 py-2 font-medium">Event</th>
                                    <th className="px-3 py-2 font-medium">Learner</th>
                                    <th className="px-3 py-2 font-medium">Lesson/Item</th>
                                    <th className="px-3 py-2 font-medium">Result</th>
                                    <th className="px-3 py-2 font-medium">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((item) => (
                                    <tr key={item.id} className="border-t align-top">
                                        <td className="px-3 py-2">{ACTIVITY_EVENT_LABELS[item.event] ?? item.event}</td>
                                        <td className="px-3 py-2">
                                            <div className="font-medium">{item.learner?.name ?? 'Unknown learner'}</div>
                                            {item.learner?.email && (
                                                <div className="text-xs text-muted-foreground">{item.learner.email}</div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-muted-foreground">
                                            {item.properties?.lesson_title ?? '-'}
                                        </td>
                                        <td className="px-3 py-2">{renderResult(item)}</td>
                                        <td className="px-3 py-2 text-muted-foreground">{item.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CourseDetailsForm({ course }) {
    const [lang, setLang] = useState('en');
    const { data, setData, post, processing, errors, isDirty } = useForm({
        _method:           'patch',
        title:             course.title,
        title_ms:          course.title_ms ?? '',
        slug:              course.slug,
        description:       course.description ?? '',
        description_ms:    course.description_ms ?? '',
        cover_image:       course.cover_image ?? '',
        cover_image_file:  null,
        cover_image_clear: false,
        category:          course.category ?? '',
        difficulty:        course.difficulty,
        status:            course.status,
        meta_title:        course.meta_title ?? '',
        meta_description:  course.meta_description ?? '',
        meta_image:        course.meta_image ?? '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.courses.update', course.id), { forceFormData: true });
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Course Details</CardTitle>
                    <LangTab lang={lang} setLang={setLang} />
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {lang === 'en' ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <Field label="Title (Bahasa Melayu)" error={errors.title_ms} hint="Leave blank to fall back to the English title for BM learners.">
                                <Input value={data.title_ms} onChange={(e) => setData('title_ms', e.target.value)} placeholder="Tajuk dalam Bahasa Melayu…" />
                            </Field>
                            <Field label="Description (Bahasa Melayu)" error={errors.description_ms}>
                                <Textarea value={data.description_ms} onChange={(e) => setData('description_ms', e.target.value)} rows={3} placeholder="Penerangan dalam Bahasa Melayu…" />
                            </Field>
                        </>
                    )}

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

                    <Separator />

                    <div className="space-y-1">
                        <p className="text-sm font-semibold">SEO &amp; Open Graph</p>
                        <p className="text-xs text-muted-foreground">Controls how this course appears in search results and when shared on social media.</p>
                    </div>

                    <Field label="Meta Title" error={errors.meta_title} hint="Defaults to the course title if left blank. Keep under 60 characters.">
                        <Input
                            value={data.meta_title}
                            onChange={(e) => setData('meta_title', e.target.value)}
                            placeholder={data.title}
                            maxLength={255}
                        />
                        <p className="text-xs text-muted-foreground text-right mt-0.5">{data.meta_title.length}/255</p>
                    </Field>

                    <Field label="Meta Description" error={errors.meta_description} hint="Shown in search results and social previews. Aim for 120–160 characters.">
                        <Textarea
                            value={data.meta_description}
                            onChange={(e) => setData('meta_description', e.target.value)}
                            rows={2}
                            placeholder="A brief description of what learners will gain from this course…"
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right mt-0.5">{data.meta_description.length}/500</p>
                    </Field>

                    <Field label="OG Image URL" error={errors.meta_image} hint="The image shown when shared on social media. Defaults to cover image if blank.">
                        <Input
                            value={data.meta_image}
                            onChange={(e) => setData('meta_image', e.target.value)}
                            placeholder="https://…"
                            type="url"
                        />
                    </Field>

                    {(data.meta_title || data.meta_description || data.meta_image) && (
                        <div className="rounded-lg border bg-muted/40 p-4 space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Search preview</p>
                            <p className="text-sm font-medium text-blue-600 truncate">{data.meta_title || data.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{data.meta_description || data.description}</p>
                        </div>
                    )}

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

function LessonRow({ lesson, onDuplicate }) {
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
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDuplicate} title="Duplicate lesson">
                    <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={handleDelete}>
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

function SectionCard({ section }) {
    const [expanded, setExpanded]               = useState(true);
    const [addingLesson, setAddingLesson]       = useState(false);
    const [renaming, setRenaming]               = useState(false);
    const [title, setTitle]                     = useState(section.title);
    const [titleMs, setTitleMs]                 = useState(section.title_ms ?? '');
    const [lessons, setLessons]                 = useState([...section.lessons].sort((a, b) => a.order - b.order));
    const [lessonDraggedId, setLessonDraggedId] = useState(null);
    const [lessonDragOverId, setLessonDragOverId] = useState(null);

    useEffect(() => {
        setLessons([...section.lessons].sort((a, b) => a.order - b.order));
    }, [section.lessons]);

    function handleLessonDragStart(e, id) {
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
        setLessonDraggedId(id);
    }

    function handleLessonDragOver(e, id) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        if (lessonDraggedId === null || lessonDraggedId === id) return;
        setLessonDragOverId(id);
    }

    function handleLessonDrop(e, targetId) {
        e.preventDefault();
        e.stopPropagation();

        if (lessonDraggedId === null || lessonDraggedId === targetId) {
            setLessonDraggedId(null);
            setLessonDragOverId(null);
            return;
        }

        const draggedIdx = lessons.findIndex(l => l.id === lessonDraggedId);
        const targetIdx  = lessons.findIndex(l => l.id === targetId);

        if (draggedIdx === -1 || targetIdx === -1) {
            setLessonDraggedId(null);
            setLessonDragOverId(null);
            return;
        }

        const newLessons = [...lessons];
        const [draggedLesson] = newLessons.splice(draggedIdx, 1);
        newLessons.splice(targetIdx, 0, draggedLesson);
        setLessons(newLessons);

        router.patch(
            route('admin.sections.lessons.reorder', section.id),
            { lessons: newLessons.map(l => l.id) },
            {
                preserveScroll: true,
                onError: () => setLessons([...section.lessons].sort((a, b) => a.order - b.order)),
            }
        );

        setLessonDraggedId(null);
        setLessonDragOverId(null);
    }

    function handleRename(e) {
        e.preventDefault();
        router.patch(route('admin.sections.update', section.id), { title, title_ms: titleMs }, {
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
                            <form onSubmit={handleRename} className="flex flex-col gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-7 text-sm"
                                    autoFocus
                                    placeholder="Section title (EN)"
                                />
                                <Input
                                    value={titleMs}
                                    onChange={(e) => setTitleMs(e.target.value)}
                                    className="h-7 text-sm"
                                    placeholder="Tajuk seksyen (BM, optional)"
                                    onBlur={handleRename}
                                />
                            </form>
                        ) : (
                            <span className="font-medium text-sm">{section.title}</span>
                        )}
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-muted-foreground">{lessons.length} lessons</span>
                        <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => { setRenaming(!renaming); setTitle(section.title); }}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => router.post(route('admin.sections.duplicate', section.id))}
                            title="Duplicate section"
                        >
                            <Copy className="h-3.5 w-3.5" />
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
                    {lessons.length > 0 && (
                        <div className="mb-2 space-y-0.5">
                            {lessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    draggable
                                    onDragStart={(e) => handleLessonDragStart(e, lesson.id)}
                                    onDragOver={(e) => handleLessonDragOver(e, lesson.id)}
                                    onDrop={(e) => handleLessonDrop(e, lesson.id)}
                                    onDragLeave={() => {
                                        if (lessonDragOverId === lesson.id) setLessonDragOverId(null);
                                    }}
                                    className={[
                                        'transition-all',
                                        lessonDraggedId === lesson.id && 'opacity-50',
                                        lessonDragOverId === lesson.id && lessonDraggedId !== lesson.id && 'border-t-2 border-primary pt-0.5',
                                    ].join(' ')}
                                >
                                    <LessonRow
                                        lesson={lesson}
                                        onDuplicate={() => router.post(route('admin.lessons.duplicate', lesson.id))}
                                    />
                                </div>
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
    const [lang, setLang]       = useState('en');
    const [content,   setContent]   = useState(
        Array.isArray(course.introduction) && course.introduction.length > 0
            ? course.introduction
            : null
    );
    const [contentMs, setContentMs] = useState(
        Array.isArray(course.introduction_ms) && course.introduction_ms.length > 0
            ? course.introduction_ms
            : null
    );
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);

    function handleSave() {
        setSaving(true);
        router.patch(
            route('admin.courses.introduction.update', course.id),
            { introduction: content, introduction_ms: contentMs },
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
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Course Introduction</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Shown on the public course page. Add bilingual content using the EN / BM tabs.
                    </p>
                </div>
                <LangTab lang={lang} setLang={setLang} />
            </div>

            {lang === 'en' ? (
                <div className="rounded-xl border overflow-hidden">
                    <BlockNoteEditor
                        key={`intro-en-${course.id}`}
                        initialContent={content}
                        onChange={setContent}
                    />
                </div>
            ) : (
                <div className="rounded-xl border overflow-hidden">
                    <BlockNoteEditor
                        key={`intro-ms-${course.id}`}
                        initialContent={contentMs}
                        onChange={setContentMs}
                    />
                </div>
            )}

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

export default function EditCourse({ course, flash, defaultTemplate, analytics, students, lessonStats, customFonts, learnerActivityFeed }) {
    const [addingSection, setAddingSection] = useState(false);
    const [sections, setSections] = useState(course.sections.sort((a, b) => a.order - b.order));
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const [reordering, setReordering] = useState(false);

    useEffect(() => {
        setSections([...course.sections].sort((a, b) => a.order - b.order));
    }, [course.sections]);

    function handleDragStart(e, id) {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedId(id);
    }

    function handleDragOver(e, id) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        if (draggedId === null || draggedId === id) return;
        setDragOverId(id);
    }

    function handleDrop(e, targetId) {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedId === null || draggedId === targetId) {
            setDraggedId(null);
            setDragOverId(null);
            return;
        }

        const draggedIdx = sections.findIndex(s => s.id === draggedId);
        const targetIdx = sections.findIndex(s => s.id === targetId);

        if (draggedIdx === -1 || targetIdx === -1) {
            setDraggedId(null);
            setDragOverId(null);
            return;
        }

        const newSections = [...sections];
        const [draggedSection] = newSections.splice(draggedIdx, 1);
        newSections.splice(targetIdx, 0, draggedSection);
        setSections(newSections);

        setReordering(true);
        router.patch(
            route('admin.courses.sections.reorder', course.id),
            { sections: newSections.map(s => s.id) },
            {
                preserveScroll: true,
                onSuccess: () => setReordering(false),
                onError: () => {
                    setSections(course.sections.sort((a, b) => a.order - b.order));
                    setReordering(false);
                },
            }
        );

        setDraggedId(null);
        setDragOverId(null);
    }

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
                <Tabs defaultValue="dashboard">
                    <TabsList className="w-full justify-start">
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
                        <TabsTrigger value="learner-activity" className="gap-2">
                            <ScrollText className="h-4 w-4" />Learner Activity
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
                                        {sections.length} section{sections.length !== 1 ? 's' : ''} · {' '}
                                        {sections.reduce((t, s) => t + s.lessons.length, 0)} lessons
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

                            {sections.length === 0 && !addingSection ? (
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
                                    {sections.map((section) => (
                                        <div
                                            key={section.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, section.id)}
                                            onDragOver={(e) => handleDragOver(e, section.id)}
                                            onDrop={(e) => handleDrop(e, section.id)}
                                            onDragLeave={() => {
                                                if (dragOverId === section.id) setDragOverId(null);
                                            }}
                                            className={[
                                                'transition-all',
                                                draggedId === section.id && 'opacity-50',
                                                dragOverId === section.id && draggedId !== section.id && 'border-t-2 border-primary pt-2',
                                            ].join(' ')}
                                        >
                                            <SectionCard section={section} />
                                        </div>
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
                            customFonts={customFonts}
                        />
                    </TabsContent>

                    {/* ── Dashboard tab ── */}
                    <TabsContent value="dashboard" className="mt-6">
                        <CourseDashboard
                            analytics={analytics}
                            students={students}
                            lessonStats={lessonStats}
                            course={course}
                        />
                    </TabsContent>

                    {/* ── Learner activity tab ── */}
                    <TabsContent value="learner-activity" className="mt-6">
                        <LearnerActivityPanel activities={learnerActivityFeed ?? []} students={students ?? []} />
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
