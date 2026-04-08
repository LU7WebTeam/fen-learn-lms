import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import BlockNoteEditor from '@/Components/BlockNoteEditor';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import InputError from '@/Components/InputError';
import PdfUpload from '@/Components/PdfUpload';
import { uploadImageFile } from '@/Components/ImageUploadWithUrl';
import { useRef, useState } from 'react';
import { Loader2, Check, Plus, Trash2, Video, FileText, HelpCircle, Upload, Link2, Image as ImageIcon, Type, Lock } from 'lucide-react';

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

function LangTab({ lang, setLang }) {
    return (
        <div className="flex items-center gap-1 rounded-md border bg-muted/50 p-0.5 w-fit">
            <button type="button" onClick={() => setLang('en')} className={['rounded px-2.5 py-0.5 text-xs font-medium transition-colors', lang === 'en' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}>EN</button>
            <button type="button" onClick={() => setLang('ms')} className={['rounded px-2.5 py-0.5 text-xs font-medium transition-colors', lang === 'ms' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'].join(' ')}>BM</button>
        </div>
    );
}

function VideoEditor({ data, setData, errors, lang }) {
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

            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <Checkbox
                    id="allow-seeking"
                    checked={data.allow_seeking ?? false}
                    onCheckedChange={(checked) => setData('allow_seeking', checked)}
                />
                <div className="flex-1">
                    <Label htmlFor="allow-seeking" className="text-sm font-medium cursor-pointer">Allow learners to skip or seek forward</Label>
                    <p className="text-xs text-muted-foreground mt-1">If unchecked, learners must watch the video sequentially without skipping ahead.</p>
                </div>
            </div>

            {lang === 'en' ? (
                <Field label="Notes / Transcript (optional)" error={errors.content}>
                    <Textarea
                        value={data.content ?? ''}
                        onChange={(e) => setData('content', e.target.value)}
                        placeholder="Add supplemental notes or a transcript for this lesson…"
                        rows={6}
                    />
                </Field>
            ) : (
                <Field label="Notes / Transcript (Bahasa Melayu, optional)" error={errors.content_ms}>
                    <Textarea
                        value={data.content_ms ?? ''}
                        onChange={(e) => setData('content_ms', e.target.value)}
                        placeholder="Nota atau transkripsi dalam Bahasa Melayu…"
                        rows={6}
                    />
                </Field>
            )}
        </div>
    );
}

function TextEditor({ data, setData, errors, lang }) {
    let initialContent, initialContentMs;
    try {
        const parsed = JSON.parse(data.content || '[]');
        if (Array.isArray(parsed)) initialContent = parsed;
    } catch { /* legacy markdown — start fresh */ }
    try {
        const parsed = JSON.parse(data.content_ms || '[]');
        if (Array.isArray(parsed)) initialContentMs = parsed;
    } catch {}

    if (lang === 'ms') {
        return (
            <Field label="Lesson Content (Bahasa Melayu)" error={errors.content_ms}>
                <div className="rounded-md border overflow-hidden">
                    <BlockNoteEditor
                        key="text-ms"
                        initialContent={initialContentMs}
                        onChange={(doc) => setData('content_ms', JSON.stringify(doc))}
                    />
                </div>
            </Field>
        );
    }

    return (
        <Field label="Lesson Content" error={errors.content}>
            <div className="rounded-md border overflow-hidden">
                <BlockNoteEditor
                    key="text-en"
                    initialContent={initialContent}
                    onChange={(doc) => setData('content', JSON.stringify(doc))}
                />
            </div>
        </Field>
    );
}

function PdfEditor({ data, setData, errors, lang }) {
    return (
        <div className="space-y-4">
            <Field label="PDF File" error={errors.pdf_file || errors.pdf_url}>
                <PdfUpload
                    value={data.pdf_file instanceof File ? data.pdf_file : (data.pdf_url ?? '')}
                    onFileChange={(file) => setData('pdf_file', file)}
                    onClear={() => { setData('pdf_file', null); setData('pdf_url', ''); }}
                />
            </Field>
            {lang === 'en' ? (
                <Field label="Description (optional)" error={errors.content} hint="Briefly describe what this PDF covers.">
                    <Textarea
                        value={data.content ?? ''}
                        onChange={(e) => setData('content', e.target.value)}
                        placeholder="This PDF covers…"
                        rows={4}
                    />
                </Field>
            ) : (
                <Field label="Description (Bahasa Melayu, optional)" error={errors.content_ms}>
                    <Textarea
                        value={data.content_ms ?? ''}
                        onChange={(e) => setData('content_ms', e.target.value)}
                        placeholder="PDF ini meliputi…"
                        rows={4}
                    />
                </Field>
            )}
        </div>
    );
}

function QuizBMEditor({ data, setData }) {
    let enParsed = { questions: [] };
    try { enParsed = JSON.parse(data.content ?? '{}'); } catch {}
    const enQuestions = enParsed.questions ?? [];
    const enDescription = enParsed.description ?? '';

    let msParsed = { questions: [] };
    try { msParsed = JSON.parse(data.content_ms || '{}'); } catch {}
    const msDescription = msParsed.description ?? '';

    function getMsQ(idx) {
        return msParsed.questions?.[idx] ?? { text: '', options: [] };
    }

    function saveMsQuestions(qs) {
        setData('content_ms', JSON.stringify({ ...msParsed, questions: qs }));
    }

    function updateMsDescription(value) {
        setData('content_ms', JSON.stringify({ ...msParsed, description: value }));
    }

    function updateMsQuestion(qIdx, field, value) {
        const qs = enQuestions.map((_, i) => {
            const cur = getMsQ(i);
            return i === qIdx ? { ...cur, [field]: value } : cur;
        });
        saveMsQuestions(qs);
    }

    function updateMsOption(qIdx, oIdx, value) {
        const qs = enQuestions.map((enQ, i) => {
            const cur = getMsQ(i);
            if (i !== qIdx) return cur;
            const opts = enQ.options.map((_, j) => j === oIdx ? value : (cur.options?.[j] ?? ''));
            return { ...cur, options: opts };
        });
        saveMsQuestions(qs);
    }

    if (enQuestions.length === 0) {
        return (
            <div className="rounded-xl border border-dashed py-12 text-center">
                <p className="text-sm text-muted-foreground">Add EN questions first, then switch to BM to translate them.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-2">
                    <p className="text-xs text-muted-foreground font-medium">Quiz description (EN): {enDescription || 'Not set'}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quiz description (BM, optional)</Label>
                    <Textarea
                        value={msDescription}
                        onChange={(e) => updateMsDescription(e.target.value)}
                        placeholder="Penerangan kuiz dalam Bahasa Melayu..."
                        rows={3}
                    />
                </CardContent>
            </Card>

            <p className="text-xs rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800">
                Translate question text and answer options. Question type and correct answer are controlled in the EN tab.
            </p>
            {enQuestions.map((enQ, qIdx) => {
                const msQ = getMsQ(qIdx);
                return (
                    <Card key={enQ.id ?? qIdx}>
                        <CardHeader className="pb-2">
                            <p className="text-xs text-muted-foreground font-medium">Q{qIdx + 1} (EN): {enQ.text}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                value={msQ.text ?? ''}
                                onChange={(e) => updateMsQuestion(qIdx, 'text', e.target.value)}
                                placeholder="Teks soalan dalam Bahasa Melayu…"
                                rows={2}
                            />
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">BM answer options</Label>
                                {enQ.options.map((enOpt, oIdx) => {
                                    const enLabel = typeof enOpt === 'object' ? (enOpt.label ?? `Option ${oIdx + 1}`) : (enOpt || `Option ${oIdx + 1}`);
                                    return (
                                        <div key={oIdx} className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground w-28 shrink-0 truncate" title={enLabel}>{enLabel}</span>
                                            <span className="text-muted-foreground shrink-0">→</span>
                                            <Input
                                                value={msQ.options?.[oIdx] ?? ''}
                                                onChange={(e) => updateMsOption(qIdx, oIdx, e.target.value)}
                                                placeholder={`BM option ${oIdx + 1}…`}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

function ImageOptionUpload({ value, onChange }) {
    const inputRef = useRef();
    const [loading, setLoading] = useState(false);
    const url = typeof value === 'object' ? value?.image_url : value;

    async function handleFile(file) {
        if (!file) return;
        setLoading(true);
        try {
            const uploaded = await uploadImageFile(file);
            onChange({ ...(typeof value === 'object' ? value : {}), image_url: uploaded });
        } catch { /* silent */ } finally {
            setLoading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <div className="space-y-1">
            {url ? (
                <div className="relative group">
                    <img
                        src={url}
                        alt=""
                        className="h-28 w-full rounded-md object-cover border cursor-pointer"
                        onClick={() => inputRef.current?.click()}
                    />
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => onChange({ ...(typeof value === 'object' ? value : {}), image_url: '' })}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <div
                    className={`flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary ${loading ? 'opacity-60 pointer-events-none' : ''}`}
                    onClick={() => !loading && inputRef.current?.click()}
                >
                    {loading
                        ? <Loader2 className="h-5 w-5 animate-spin" />
                        : <><ImageIcon className="h-6 w-6" /><p className="text-xs">Upload image</p></>
                    }
                </div>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
            />
        </div>
    );
}

function QuizEditor({ data, setData, errors, lang }) {
    if (lang === 'ms') {
        return <QuizBMEditor data={data} setData={setData} />;
    }

    const rawContent = data.content ?? '';
    let parsed = { questions: [], passing_score: 70, max_attempts: 0, description: '', show_answer_feedback: true, answer_review_requires_pass: false };
    try { parsed = JSON.parse(rawContent); } catch {}

    const questions    = parsed.questions    ?? [];
    // Allow passing_score to be 0 (informational quiz)
    const passingScore = typeof parsed.passing_score === 'number' ? parsed.passing_score : 70;
    const maxAttempts  = parsed.max_attempts  ?? 0;
    const description  = typeof parsed.description === 'string' ? parsed.description : '';
    const showAnswerFeedback = parsed.show_answer_feedback !== false;
    const answerReviewRequiresPass = parsed.answer_review_requires_pass === true;

    function save(qs = questions, ps = passingScore, ma = maxAttempts, desc = description, saf = showAnswerFeedback, arrp = answerReviewRequiresPass) {
        // If ps is blank, null, or NaN, treat as informational (no passing mark)
        let passing_score = ps;
        if (ps === '' || ps === null || isNaN(ps)) passing_score = 0;
        setData('content', JSON.stringify({
            questions: qs,
            passing_score,
            max_attempts: ma,
            description: desc,
            show_answer_feedback: saf,
            answer_review_requires_pass: arrp,
        }));
    }

    function addQuestion() {
        save([...questions, { id: Date.now(), type: 'text', text: '', options: ['', '', '', ''], correct: 0, multi_answer: false }]);
    }

    function updateQuestion(idx, field, value) {
        const qs = questions.map((q, i) => i === idx ? { ...q, [field]: value } : q);
        save(qs);
    }

    function updateOption(qIdx, oIdx, value) {
        const qs = questions.map((q, i) => {
            if (i !== qIdx) return q;
            const opts = [...(q.options ?? [])];
            opts[oIdx] = value;
            return { ...q, options: opts };
        });
        save(qs);
    }

    function addOption(qIdx) {
        const qs = questions.map((q, i) => {
            if (i !== qIdx) return q;
            return { ...q, options: [...(q.options ?? []), q.type === 'image_choice' ? { image_url: '', label: '' } : ''] };
        });
        save(qs);
    }

    function removeOption(qIdx, oIdx) {
        const qs = questions.map((q, i) => {
            if (i !== qIdx) return q;
            const opts = [...(q.options ?? [])];
            opts.splice(oIdx, 1);
            return { ...q, options: opts };
        });
        save(qs);
    }

    function removeQuestion(qIdx) {
        const qs = questions.filter((_, i) => i !== qIdx);
        save(qs);
    }

    function toggleCorrectAnswer(qIdx, oIdx) {
        const q = questions[qIdx];
        if (!q.multi_answer) return;
        let correct = Array.isArray(q.correct) ? [...q.correct] : [];
        if (correct.includes(oIdx)) correct = correct.filter(i => i !== oIdx);
        else correct.push(oIdx);
        updateQuestion(qIdx, 'correct', correct);
    }

    function toggleQuestionType(qIdx, newType) {
        const q = questions[qIdx];
        let newOptions;
        if (newType === 'image_choice') {
            newOptions = (q.options ?? []).map(opt =>
                typeof opt === 'object' ? opt : { image_url: '', label: opt ?? '' }
            );
            if (newOptions.length < 2) newOptions = [{ image_url: '', label: '' }, { image_url: '', label: '' }];
        } else {
            newOptions = (q.options ?? []).map(opt =>
                typeof opt === 'object' ? (opt.label ?? '') : opt
            );
            if (newOptions.length < 2) newOptions = ['', ''];
        }
        const qs = questions.map((item, i) => i === qIdx ? { ...item, type: newType, options: newOptions } : item);
        save(qs);
    }

    return (
        <div className="space-y-6">
            {errors.content && <InputError message={errors.content} />}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Passing score</p>
                        <p className="text-xs text-muted-foreground">Min % required to pass. Leave blank or 0 for informational quiz (no passing mark).</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={passingScore === 0 ? '' : passingScore}
                            placeholder="0 = info only"
                            onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                if (isNaN(val) || val < 0) save(undefined, 0);
                                else if (val > 100) save(undefined, 100);
                                else save(undefined, val);
                            }}
                            className="w-20 text-center"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Allowed attempts</p>
                        <p className="text-xs text-muted-foreground">How many times a learner can take this quiz</p>
                    </div>
                    <div className="shrink-0">
                        <select
                            value={maxAttempts}
                            onChange={(e) => save(undefined, undefined, parseInt(e.target.value))}
                            className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value={0}>Unlimited</option>
                            <option value={1}>1 — once only</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                        </select>
                    </div>
                </div>
            </div>

            <Field
                label="Quiz description (optional)"
                hint="Shown to learners before they start the quiz."
            >
                <Textarea
                    value={description}
                    onChange={(e) => save(undefined, undefined, undefined, e.target.value)}
                    placeholder="Briefly describe this quiz..."
                    rows={3}
                />
            </Field>

            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <Checkbox
                    id="show-answer-feedback"
                    checked={showAnswerFeedback}
                    onCheckedChange={(checked) => save(undefined, undefined, undefined, undefined, checked === true)}
                />
                <div className="flex-1">
                    <Label htmlFor="show-answer-feedback" className="text-sm font-medium cursor-pointer">Show correct / incorrect answer feedback after submit</Label>
                    <p className="text-xs text-muted-foreground mt-1">If disabled, learners only see marks and percentage after submission.</p>
                </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                <Checkbox
                    id="answer-review-requires-pass"
                    checked={answerReviewRequiresPass}
                    disabled={!showAnswerFeedback}
                    onCheckedChange={(checked) => save(undefined, undefined, undefined, undefined, undefined, checked === true)}
                />
                <div className="flex-1">
                    <Label htmlFor="answer-review-requires-pass" className="text-sm font-medium cursor-pointer">Allow answer review only if passed</Label>
                    <p className="text-xs text-muted-foreground mt-1">When enabled, failed attempts will only see score and retry options (if available).</p>
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
                        <Card key={q.id} className="overflow-visible">
                            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                                <div className="flex-1">
                                    <Label className="text-sm font-medium">Question {qIdx + 1}</Label>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeQuestion(qIdx)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={q.text}
                                    onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                                    placeholder="Enter your question…"
                                    rows={2}
                                />

                                {/* ── Text options ── */}
                                {(q.type ?? 'text') === 'text' && (
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">
                                            {q.multi_answer ? 'Answer options — check all correct answers' : 'Answer options — click the circle to mark the correct one'}
                                        </Label>
                                        {q.options.map((opt, oIdx) => {
                                            const isMarkedCorrect = q.multi_answer
                                                ? (Array.isArray(q.correct) && q.correct.includes(oIdx))
                                                : q.correct === oIdx;
                                            return (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => q.multi_answer ? toggleCorrectAnswer(qIdx, oIdx) : updateQuestion(qIdx, 'correct', oIdx)}
                                                    className={['flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 transition-colors', q.multi_answer ? 'rounded' : 'rounded-full', isMarkedCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground'].join(' ')}
                                                >
                                                    {isMarkedCorrect && <Check className="h-3 w-3" />}
                                                </button>
                                                <Input
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                    placeholder={`Option ${oIdx + 1}`}
                                                    className="h-8 text-sm"
                                                />
                                                {q.options.length > 2 && (
                                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => removeOption(qIdx, oIdx)}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                            );
                                        })}
                                        {q.options.length < 6 && (
                                            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => addOption(qIdx)}>
                                                <Plus className="mr-1 h-3 w-3" /> Add option
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* ── Image choice options ── */}
                                {q.type === 'image_choice' && (
                                    <div className="space-y-3">
                                        <Label className="text-xs text-muted-foreground">Image options — click the ring to mark correct, hover image to delete</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {q.options.map((opt, oIdx) => {
                                                const isMarkedCorrect = q.multi_answer
                                                    ? (Array.isArray(q.correct) && q.correct.includes(oIdx))
                                                    : q.correct === oIdx;
                                                return (
                                                <div key={oIdx} className={['rounded-lg border-2 p-2 transition-colors', isMarkedCorrect ? 'border-green-500' : 'border-border'].join(' ')}>
                                                    <ImageOptionUpload
                                                        value={opt}
                                                        onChange={(val) => updateOption(qIdx, oIdx, val)}
                                                    />
                                                    <div className="mt-2 flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => q.multi_answer ? toggleCorrectAnswer(qIdx, oIdx) : updateQuestion(qIdx, 'correct', oIdx)}
                                                            className={['flex h-4 w-4 flex-shrink-0 items-center justify-center border-2 transition-colors', q.multi_answer ? 'rounded' : 'rounded-full', isMarkedCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground'].join(' ')}
                                                        >
                                                            {isMarkedCorrect && <Check className="h-2.5 w-2.5" />}
                                                        </button>
                                                        <Input
                                                            value={typeof opt === 'object' ? (opt.label ?? '') : ''}
                                                            onChange={(e) => updateOption(qIdx, oIdx, { ...(typeof opt === 'object' ? opt : { image_url: '' }), label: e.target.value })}
                                                            placeholder="Caption (optional)"
                                                            className="h-7 text-xs"
                                                        />
                                                        {q.options.length > 2 && (
                                                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => removeOption(qIdx, oIdx)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                        {q.options.length < 6 && (
                                            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={() => addOption(qIdx)}>
                                                <Plus className="mr-1 h-3 w-3" /> Add image option
                                            </Button>
                                        )}
                                    </div>
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

export default function EditLesson({ lesson, courseLessons = [], flash }) {
    const meta = TYPE_META[lesson.type] ?? TYPE_META.text;
    const Icon = meta.icon;
    const [lang, setLang] = useState('en');

    const { data, setData, post, processing, errors, isDirty } = useForm({
        _method:                 'patch',
        title:                   lesson.title,
        title_ms:                lesson.title_ms ?? '',
        duration_minutes:        lesson.duration_minutes ?? 0,
        is_free_preview:         lesson.is_free_preview ?? false,
        allow_seeking:           lesson.allow_seeking ?? false,
        prerequisite_lesson_id:  lesson.prerequisite_lesson_id ?? '',
        video_url:               lesson.video_url ?? '',
        video_file:              null,
        pdf_url:                 lesson.pdf_url ?? '',
        pdf_file:                null,
        content:                 lesson.content ?? '',
        content_ms:              lesson.content_ms ?? '',
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
                                href={route('admin.courses.edit', lesson.section.course.slug)}
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
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Lesson Settings</CardTitle>
                            <LangTab lang={lang} setLang={setLang} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-5 sm:grid-cols-2">
                            {lang === 'en' ? (
                                <Field label="Title *" error={errors.title}>
                                    <Input value={data.title} onChange={(e) => setData('title', e.target.value)} />
                                </Field>
                            ) : (
                                <Field label="Title (Bahasa Melayu)" error={errors.title_ms} hint="Leave blank to fall back to the English title.">
                                    <Input value={data.title_ms} onChange={(e) => setData('title_ms', e.target.value)} placeholder="Tajuk dalam Bahasa Melayu…" />
                                </Field>
                            )}
                            <Field label="Duration (minutes)" error={errors.duration_minutes}>
                                <Input
                                    type="number"
                                    min={0}
                                    value={data.duration_minutes}
                                    onChange={(e) => setData('duration_minutes', parseInt(e.target.value) || 0)}
                                />
                            </Field>
                        </div>
                        {courseLessons.length > 0 && (
                            <div className="mt-5">
                                <Field
                                    label={<span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" />Prerequisite lesson</span>}
                                    hint="Learners must complete this lesson before accessing the current one."
                                    error={errors.prerequisite_lesson_id}
                                >
                                    <select
                                        value={data.prerequisite_lesson_id ?? ''}
                                        onChange={(e) => setData('prerequisite_lesson_id', e.target.value || '')}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">None — no prerequisite</option>
                                        {courseLessons.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.section} → {l.title}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>
                        )}

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

                    {lesson.type === 'video' && <VideoEditor data={data} setData={setData} errors={errors} lang={lang} />}
                    {lesson.type === 'text'  && <TextEditor  data={data} setData={setData} errors={errors} lang={lang} />}
                    {lesson.type === 'quiz'  && <QuizEditor  data={data} setData={setData} errors={errors} lang={lang} />}
                    {lesson.type === 'pdf'   && <PdfEditor   data={data} setData={setData} errors={errors} lang={lang} />}
                </div>

                <div className="flex justify-between">
                    <Button type="button" variant="ghost" asChild>
                        <Link href={route('admin.courses.edit', lesson.section.course.slug)}>
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
