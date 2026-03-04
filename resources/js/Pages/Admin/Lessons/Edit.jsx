import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import InputError from '@/Components/InputError';
import { useState } from 'react';
import { Loader2, Check, Plus, Trash2, Video, FileText, HelpCircle } from 'lucide-react';

const TYPE_META = {
    video: { icon: Video,       label: 'Video',  color: 'text-blue-500'  },
    text:  { icon: FileText,    label: 'Text',   color: 'text-green-500' },
    quiz:  { icon: HelpCircle,  label: 'Quiz',   color: 'text-purple-500'},
};

function Field({ label, error, hint, children }) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            {children}
            {hint  && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <InputError message={error} />}
        </div>
    );
}

function VideoEditor({ data, setData, errors }) {
    return (
        <div className="space-y-5">
            <Field
                label="Video URL"
                error={errors.video_url}
                hint="Paste a YouTube, Vimeo, or direct .mp4 URL."
            >
                <Input
                    value={data.video_url ?? ''}
                    onChange={(e) => setData('video_url', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    type="url"
                />
            </Field>

            {data.video_url && data.video_url.includes('youtube.com') && (
                <div className="aspect-video overflow-hidden rounded-lg border bg-black">
                    <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${new URL(data.video_url).searchParams.get('v')}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            )}

            <Field label="Notes / Transcript (optional)" error={errors.content}>
                <Textarea
                    value={data.content ?? ''}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder="Add supplemental notes or a transcript for this lesson…"
                    rows={6}
                />
            </Field>
        </div>
    );
}

function TextEditor({ data, setData, errors }) {
    return (
        <Field
            label="Lesson Content"
            error={errors.content}
            hint="Write the lesson text. Markdown is supported and will be rendered for learners."
        >
            <Textarea
                value={data.content ?? ''}
                onChange={(e) => setData('content', e.target.value)}
                placeholder="# Lesson Title&#10;&#10;Write your lesson content here…"
                rows={20}
                className="font-mono text-sm"
            />
        </Field>
    );
}

function QuizEditor({ data, setData, errors }) {
    const EMPTY_QUESTION = { question: '', options: ['', '', '', ''], correct: 0 };

    let parsed = { questions: [], passing_score: 70 };
    try {
        const p = data.content ? JSON.parse(data.content) : {};
        parsed.questions    = Array.isArray(p.questions) ? p.questions : [];
        parsed.passing_score = p.passing_score ?? 70;
    } catch { /* keep defaults */ }

    const questions    = parsed.questions;
    const passingScore = parsed.passing_score;

    function save(qs, ps) {
        setData('content', JSON.stringify({
            questions:    qs ?? questions,
            passing_score: ps ?? passingScore,
        }));
    }

    function addQuestion() {
        save([...questions, { ...EMPTY_QUESTION, options: ['', '', '', ''] }]);
    }

    function removeQuestion(qi) {
        save(questions.filter((_, i) => i !== qi));
    }

    function updateQuestion(qi, field, value) {
        const qs = questions.map((q, i) => i === qi ? { ...q, [field]: value } : q);
        save(qs);
    }

    function updateOption(qi, oi, value) {
        const qs = questions.map((q, i) => {
            if (i !== qi) return q;
            const options = q.options.map((o, j) => j === oi ? value : o);
            return { ...q, options };
        });
        save(qs);
    }

    function addOption(qi) {
        const qs = questions.map((q, i) => i === qi ? { ...q, options: [...q.options, ''] } : q);
        save(qs);
    }

    function removeOption(qi, oi) {
        const qs = questions.map((q, i) => {
            if (i !== qi) return q;
            const options = q.options.filter((_, j) => j !== oi);
            const correct = q.correct >= oi && q.correct > 0 ? q.correct - 1 : q.correct;
            return { ...q, options, correct };
        });
        save(qs);
    }

    return (
        <div className="space-y-6">
            {errors.content && <InputError message={errors.content} />}

            {/* Passing score */}
            <div className="flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3">
                <div className="flex-1">
                    <p className="text-sm font-medium">Passing score</p>
                    <p className="text-xs text-muted-foreground">Minimum percentage required to pass this quiz</p>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        min={1}
                        max={100}
                        value={passingScore}
                        onChange={(e) => save(undefined, Math.min(100, Math.max(1, parseInt(e.target.value) || 70)))}
                        className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                </div>
            </div>

            {questions.length === 0 ? (
                <div className="rounded-xl border border-dashed py-12 text-center">
                    <p className="mb-4 text-sm text-muted-foreground">No questions yet.</p>
                    <Button onClick={addQuestion} type="button" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Question
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((q, qi) => (
                        <Card key={qi}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    <span className="mt-2 text-sm font-semibold text-muted-foreground shrink-0">Q{qi + 1}</span>
                                    <div className="flex-1 space-y-1.5">
                                        <Input
                                            value={q.question}
                                            onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                                            placeholder="Enter the question…"
                                        />
                                    </div>
                                    <Button
                                        type="button" variant="ghost" size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                                        onClick={() => removeQuestion(qi)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    Answer options — click the radio to mark correct
                                </p>
                                {q.options.map((opt, oi) => (
                                    <div key={oi} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`correct-${qi}`}
                                            checked={q.correct === oi}
                                            onChange={() => updateQuestion(qi, 'correct', oi)}
                                            className="h-4 w-4 text-primary accent-primary shrink-0 cursor-pointer"
                                            title="Mark as correct answer"
                                        />
                                        <Input
                                            value={opt}
                                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                                            placeholder={`Option ${oi + 1}`}
                                            className={`flex-1 ${q.correct === oi ? 'border-green-500 ring-1 ring-green-200' : ''}`}
                                        />
                                        {q.options.length > 2 && (
                                            <Button
                                                type="button" variant="ghost" size="icon"
                                                className="h-8 w-8 text-muted-foreground shrink-0"
                                                onClick={() => removeOption(qi, oi)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {q.options.length < 6 && (
                                    <Button
                                        type="button" variant="ghost" size="sm"
                                        className="text-muted-foreground"
                                        onClick={() => addOption(qi)}
                                    >
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        Add Option
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {questions.length > 0 && (
                <Button type="button" variant="outline" onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            )}
        </div>
    );
}

export default function EditLesson({ lesson, flash }) {
    const meta = TYPE_META[lesson.type] ?? TYPE_META.text;
    const Icon = meta.icon;

    const { data, setData, patch, processing, errors, isDirty } = useForm({
        title:            lesson.title,
        duration_minutes: lesson.duration_minutes ?? 0,
        is_free_preview:  lesson.is_free_preview ?? false,
        video_url:        lesson.video_url ?? '',
        content:          lesson.content ?? '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        patch(route('admin.lessons.update', lesson.id));
    }

    return (
        <AdminLayout title={`Lesson: ${lesson.title}`}>
            <Head title={`${lesson.title} — Lesson Editor`} />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Link href={route('admin.courses.index')} className="hover:underline">Courses</Link>
                            <span>/</span>
                            <Link
                                href={route('admin.courses.edit', lesson.section.course_id)}
                                className="hover:underline"
                            >
                                {lesson.section.course?.title ?? 'Edit Course'}
                            </Link>
                            <span>/</span>
                            <span>Lesson</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon className={`h-5 w-5 ${meta.color}`} />
                            <h2 className="text-2xl font-bold tracking-tight">{lesson.title}</h2>
                            <Badge variant="outline" className="capitalize">{meta.label}</Badge>
                        </div>
                    </div>
                    <Button type="submit" disabled={processing || !isDirty}>
                        {processing
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                            : <><Check className="mr-2 h-4 w-4" />Save Lesson</>}
                    </Button>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800 border border-green-200">
                        {flash.success}
                    </div>
                )}

                <Card>
                    <CardHeader><CardTitle>Lesson Settings</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Title *" error={errors.title}>
                                <Input value={data.title} onChange={(e) => setData('title', e.target.value)} />
                            </Field>
                            <Field label="Duration (minutes)" error={errors.duration_minutes}>
                                <Input
                                    type="number"
                                    min={0}
                                    value={data.duration_minutes}
                                    onChange={(e) => setData('duration_minutes', parseInt(e.target.value) || 0)}
                                />
                            </Field>
                        </div>
                        <div className="mt-5 flex items-center gap-2">
                            <Checkbox
                                id="free-preview"
                                checked={data.is_free_preview}
                                onCheckedChange={(v) => setData('is_free_preview', v)}
                            />
                            <Label htmlFor="free-preview" className="cursor-pointer">
                                Free preview — visible to non-enrolled learners
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${meta.color}`} />
                        {meta.label} Content
                    </h3>

                    {lesson.type === 'video' && <VideoEditor data={data} setData={setData} errors={errors} />}
                    {lesson.type === 'text'  && <TextEditor  data={data} setData={setData} errors={errors} />}
                    {lesson.type === 'quiz'  && <QuizEditor  data={data} setData={setData} errors={errors} />}
                </div>

                <div className="flex justify-between">
                    <Button type="button" variant="ghost" asChild>
                        <Link href={route('admin.courses.edit', lesson.section.course_id)}>
                            ← Back to curriculum
                        </Link>
                    </Button>
                    <Button type="submit" disabled={processing || !isDirty}>
                        {processing
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
                            : <><Check className="mr-2 h-4 w-4" />Save Lesson</>}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
