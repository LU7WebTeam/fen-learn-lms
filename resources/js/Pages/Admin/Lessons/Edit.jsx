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
import PdfUpload from '@/Components/PdfUpload';
import { useRef, useState } from 'react';
import { Loader2, Check, Plus, Trash2, Video, FileText, HelpCircle, Upload, Link2 } from 'lucide-react';

const TYPE_META = {
    video: { icon: Video,       label: 'Video',     color: 'text-blue-500'   },
    text:  { icon: FileText,    label: 'Text',      color: 'text-green-500'  },
    quiz:  { icon: HelpCircle,  label: 'Quiz',      color: 'text-purple-500' },
    pdf:   { icon: FileText,    label: 'PDF',       color: 'text-red-500'    },
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

function ModeTab({ active, onClick, icon: Icon, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors',
                active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    );
}

function VideoEditor({ data, setData, errors }) {
    const [mode, setMode] = useState(() =>
        data.video_url && data.video_url.includes('/storage/') ? 'upload' : 'url'
    );
    const fileInputRef = useRef();

    const uploadedName = data.video_url && data.video_url.includes('/storage/')
        ? decodeURIComponent(data.video_url.split('/').pop())
        : null;
    const pendingFile = data.video_file instanceof File ? data.video_file : null;
    const displayName = pendingFile ? pendingFile.name : uploadedName;

    function handleVideoFile(file) {
        if (!file) return;
        setData('video_file', file);
    }

    function clearVideo() {
        setData('video_file', null);
        setData('video_url', '');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className="space-y-5">
            <div className="flex rounded-lg border p-1 gap-1 w-fit">
                <ModeTab active={mode === 'url'}    onClick={() => setMode('url')}    icon={Link2}   label="External URL" />
                <ModeTab active={mode === 'upload'} onClick={() => setMode('upload')} icon={Upload}  label="Upload file"  />
            </div>

            {mode === 'url' && (
                <>
                    <Field label="Video URL" error={errors.video_url} hint="Paste a YouTube, Vimeo, or direct .mp4 URL.">
                        <Input
                            value={data.video_url ?? ''}
                            onChange={(e) => setData('video_url', e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            type="url"
                        />
                    </Field>

                    {data.video_url && data.video_url.includes('youtube.com') && (() => {
                        try {
                            const vid = new URL(data.video_url).searchParams.get('v');
                            return vid ? (
                                <div className="aspect-video overflow-hidden rounded-lg border bg-black">
                                    <iframe
                                        className="h-full w-full"
                                        src={`https://www.youtube.com/embed/${vid}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            ) : null;
                        } catch { return null; }
                    })()}
                </>
            )}

            {mode === 'upload' && (
                <div className="space-y-2">
                    {displayName ? (
                        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                            <Video className="h-8 w-8 flex-shrink-0 text-blue-500" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{displayName}</p>
                                {uploadedName && !pendingFile && (
                                    <a href={data.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                                        View current file ↗
                                    </a>
                                )}
                                {pendingFile && (
                                    <p className="text-xs text-muted-foreground">
                                        {(pendingFile.size / 1024 / 1024).toFixed(1)} MB — will be uploaded on save
                                    </p>
                                )}
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-1.5 h-3.5 w-3.5" /> Replace
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={clearVideo}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={(e) => { e.preventDefault(); handleVideoFile(e.dataTransfer.files[0]); }}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <Video className="h-10 w-10" />
                            <p className="text-sm font-medium">Click or drag & drop to upload</p>
                            <p className="text-xs">MP4, WebM, MOV — up to 200 MB</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/quicktime"
                        className="hidden"
                        onChange={(e) => handleVideoFile(e.target.files[0])}
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
                placeholder="Write your lesson content here…"
                rows={16}
            />
        </Field>
    );
}

function PdfEditor({ data, setData, errors }) {
    return (
        <div className="space-y-4">
            <Field label="PDF File" error={errors.pdf_file || errors.pdf_url}>
                <PdfUpload
                    value={data.pdf_file instanceof File ? data.pdf_file : (data.pdf_url ?? '')}
                    onFileChange={(file) => setData('pdf_file', file)}
                    onClear={() => { setData('pdf_file', null); setData('pdf_url', ''); }}
                />
            </Field>
            <Field
                label="Description (optional)"
                error={errors.content}
                hint="Briefly describe what this PDF covers."
            >
                <Textarea
                    value={data.content ?? ''}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder="This PDF covers…"
                    rows={4}
                />
            </Field>
        </div>
    );
}

function QuizEditor({ data, setData, errors }) {
    const rawContent = data.content ?? '';
    let parsed = { questions: [], passing_score: 70 };
    try { parsed = JSON.parse(rawContent); } catch {}

    const questions   = parsed.questions    ?? [];
    const passingScore = parsed.passing_score ?? 70;

    function save(qs = questions, ps = passingScore) {
        setData('content', JSON.stringify({ questions: qs, passing_score: ps }));
    }

    function addQuestion() {
        save([...questions, { id: Date.now(), text: '', options: ['', '', '', ''], correct: 0 }]);
    }

    function updateQuestion(idx, field, value) {
        const qs = questions.map((q, i) => i === idx ? { ...q, [field]: value } : q);
        save(qs);
    }

    function updateOption(qIdx, oIdx, value) {
        const qs = questions.map((q, i) => {
            if (i !== qIdx) return q;
            const options = q.options.map((o, j) => j === oIdx ? value : o);
            return { ...q, options };
        });
        save(qs);
    }

    function addOption(qIdx) {
        const qs = questions.map((q, i) => i === qIdx ? { ...q, options: [...q.options, ''] } : q);
        save(qs);
    }

    function removeOption(qIdx, oIdx) {
        const qs = questions.map((q, i) => {
            if (i !== qIdx) return q;
            const options = q.options.filter((_, j) => j !== oIdx);
            const correct = q.correct >= options.length ? 0 : (q.correct > oIdx ? q.correct - 1 : q.correct);
            return { ...q, options, correct };
        });
        save(qs);
    }

    function removeQuestion(idx) {
        save(questions.filter((_, i) => i !== idx));
    }

    return (
        <div className="space-y-6">
            {errors.content && <InputError message={errors.content} />}

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
                        Add first question
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((q, qIdx) => (
                        <Card key={q.id ?? qIdx}>
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Question {qIdx + 1}</CardTitle>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => removeQuestion(qIdx)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={q.text}
                                    onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                                    placeholder="Enter your question…"
                                    rows={2}
                                />
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Answer options — click the circle to mark the correct one</Label>
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateQuestion(qIdx, 'correct', oIdx)}
                                                className={[
                                                    'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                                    q.correct === oIdx
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : 'border-muted-foreground',
                                                ].join(' ')}
                                            >
                                                {q.correct === oIdx && <Check className="h-3 w-3" />}
                                            </button>
                                            <Input
                                                value={opt}
                                                onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                placeholder={`Option ${oIdx + 1}`}
                                                className="h-8 text-sm"
                                            />
                                            {q.options.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 flex-shrink-0"
                                                    onClick={() => removeOption(qIdx, oIdx)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {q.options.length < 6 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => addOption(qIdx)}
                                        >
                                            <Plus className="mr-1 h-3 w-3" /> Add option
                                        </Button>
                                    )}
                                </div>
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

    const { data, setData, post, processing, errors, isDirty } = useForm({
        _method:          'patch',
        title:            lesson.title,
        duration_minutes: lesson.duration_minutes ?? 0,
        is_free_preview:  lesson.is_free_preview ?? false,
        video_url:        lesson.video_url ?? '',
        video_file:       null,
        pdf_url:          lesson.pdf_url ?? '',
        pdf_file:         null,
        content:          lesson.content ?? '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route('admin.lessons.update', lesson.id), { forceFormData: true });
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
                    {lesson.type === 'pdf'   && <PdfEditor   data={data} setData={setData} errors={errors} />}
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
