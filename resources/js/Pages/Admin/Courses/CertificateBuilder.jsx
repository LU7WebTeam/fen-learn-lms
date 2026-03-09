import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import ImageUploadWithUrl from '@/Components/ImageUploadWithUrl';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/Components/ui/accordion';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Award, Check, Loader2, Eye, EyeOff, RotateCcw,
    Type, Image as ImageIcon, Palette, Settings2, Users, BookOpen, Percent
} from 'lucide-react';

// ─── Page size map (mm) ────────────────────────────────────────────────────────
const PAGE_DIMS = {
    a4:     { landscape: [297, 210], portrait: [210, 297] },
    letter: { landscape: [279.4, 215.9], portrait: [215.9, 279.4] },
};

// ─── Live Preview ──────────────────────────────────────────────────────────────
const PREVIEW_W = 520; // px target width

function CertPreview({ template, courseTitle }) {
    const size        = template.size        || 'a4';
    const orientation = template.orientation || 'landscape';
    const [pageW, pageH] = PAGE_DIMS[size]?.[orientation] || [297, 210];

    const PX_PER_MM   = 3.7795;
    const nativeW     = pageW * PX_PER_MM;
    const nativeH     = pageH * PX_PER_MM;
    const scale       = PREVIEW_W / nativeW;
    const previewH    = nativeH * scale;

    const bg       = template.background  || {};
    const branding = template.branding    || {};
    const fields   = template.fields      || [];
    const signatory = template.signatory  || {};

    const showTopBar    = branding.show_top_bar    ?? true;
    const showBottomBar = branding.show_bottom_bar ?? true;
    const topBarPct     = showTopBar    ? 8.5  : 0;
    const bottomBarPct  = showBottomBar ? 6.7  : 0;
    const accentPct     = showTopBar    ? 1.4  : 0;
    const accent2Pct    = showBottomBar ? 1.0  : 0;

    const bgStyle = bg.type === 'image' && bg.image_url
        ? { backgroundImage: `url(${bg.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: bg.color || '#fdf8f4' };

    const dynamicValues = {
        recipient_name:  'Jane Smith',
        course_title:    courseTitle || 'Sample Course Title',
        completion_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        certificate_id:  'ABC-123-SAMPLE',
        signatory_name:  signatory.name  || '',
        signatory_title: signatory.title || '',
    };

    function getFieldText(field) {
        if (field.type === 'dynamic') return dynamicValues[field.id] || '';
        return field.text || '';
    }

    return (
        <div
            style={{ width: PREVIEW_W, height: previewH, position: 'relative', overflow: 'hidden', flexShrink: 0 }}
            className="rounded-md shadow-lg border"
        >
            <div
                style={{
                    width: nativeW, height: nativeH,
                    transform: `scale(${scale})`, transformOrigin: 'top left',
                    position: 'relative', ...bgStyle,
                }}
            >
                {/* Top bar */}
                {showTopBar && (
                    <>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0,
                            height: `${topBarPct}%`,
                            background: branding.top_bar_color || '#8B1A4A',
                        }} />
                        <div style={{
                            position: 'absolute', top: `${topBarPct}%`, left: 0, right: 0,
                            height: `${accentPct}%`,
                            background: branding.accent_color || '#C8A96E',
                        }} />
                        {(branding.show_logo ?? true) && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0,
                                height: `${topBarPct}%`,
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <div style={{ color: '#fff', fontSize: nativeH * 0.038, fontWeight: 'bold', letterSpacing: 4 }}>
                                    {branding.logo_text || 'FENLearn'}
                                </div>
                                {branding.tagline && (
                                    <div style={{ color: '#F0D9A8', fontSize: nativeH * 0.018, marginTop: 2 }}>
                                        {branding.tagline}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Bottom bar */}
                {showBottomBar && (
                    <>
                        <div style={{
                            position: 'absolute', bottom: `${bottomBarPct}%`, left: 0, right: 0,
                            height: `${accent2Pct}%`,
                            background: branding.accent_color || '#C8A96E',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: `${bottomBarPct}%`,
                            background: branding.bottom_bar_color || '#8B1A4A',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: `0 ${nativeW * 0.05}px`,
                        }}>
                            <span style={{ color: '#F0D9A8', fontSize: nativeH * 0.018 }}>
                                {dynamicValues.completion_date}
                            </span>
                            <span style={{ color: '#fff', fontSize: nativeH * 0.018, fontWeight: 'bold' }}>
                                Certificate of Completion
                            </span>
                            <span style={{ color: '#F0D9A8', fontSize: nativeH * 0.015 }}>
                                ID: {dynamicValues.certificate_id}
                            </span>
                        </div>
                    </>
                )}

                {/* Content fields */}
                {fields.filter(f => f.visible).map(field => {
                    const text = getFieldText(field);
                    if (!text) return null;
                    const topPct    = field.y || 0;
                    const fontSize  = (field.font_size || 12) * (nativeH / 210) * 0.85;
                    const textAlign = field.align || 'center';
                    let leftStyle   = {};
                    if (textAlign === 'left') {
                        leftStyle = { paddingLeft: `${field.x || 0}%`, textAlign: 'left' };
                    } else if (textAlign === 'right') {
                        leftStyle = { paddingRight: `${100 - (field.x || 0)}%`, textAlign: 'right' };
                    }
                    return (
                        <div key={field.id} style={{
                            position: 'absolute',
                            top: `${topPct}%`,
                            left: 0, right: 0,
                            fontSize,
                            color: field.color || '#1e1e2e',
                            fontWeight: field.bold   ? 'bold'   : 'normal',
                            fontStyle:  field.italic ? 'italic' : 'normal',
                            textAlign,
                            lineHeight: 1,
                            ...leftStyle,
                        }}>
                            {text}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Color input with swatch ────────────────────────────────────────────────
function ColorInput({ value, onChange, label }) {
    return (
        <div className="space-y-1.5">
            {label && <Label className="text-xs">{label}</Label>}
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value || '#000000'}
                    onChange={e => onChange(e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border border-input p-0.5"
                />
                <Input
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder="#000000"
                    className="h-8 flex-1 font-mono text-xs"
                />
            </div>
        </div>
    );
}

// ─── Single field editor row ────────────────────────────────────────────────
function FieldRow({ field, onChange }) {
    const [open, setOpen] = useState(false);

    function set(key, val) { onChange({ ...field, [key]: val }); }

    return (
        <div className="rounded-lg border bg-card">
            <div
                className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted/30"
                onClick={() => setOpen(o => !o)}
            >
                <button
                    type="button"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={e => { e.stopPropagation(); set('visible', !field.visible); }}
                    title={field.visible ? 'Hide field' : 'Show field'}
                >
                    {field.visible
                        ? <Eye className="h-4 w-4 text-green-600" />
                        : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                </button>
                <span className="flex-1 text-sm font-medium">{field.label}</span>
                <Badge variant="outline" className="text-xs capitalize shrink-0">
                    {field.type}
                </Badge>
                <span className="text-xs text-muted-foreground shrink-0">
                    y={field.y}%
                </span>
            </div>

            {open && (
                <div className="border-t px-3 pb-3 pt-3 space-y-3">
                    {field.type === 'static' && (
                        <div className="space-y-1.5">
                            <Label className="text-xs">Text</Label>
                            <Input
                                value={field.text || ''}
                                onChange={e => set('text', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Field text…"
                            />
                        </div>
                    )}
                    {field.type === 'dynamic' && (
                        <p className="text-xs text-muted-foreground italic">
                            Content is filled automatically at generation time.
                        </p>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Vertical pos (y %)</Label>
                            <Input
                                type="number" min="0" max="100" step="1"
                                value={field.y || 0}
                                onChange={e => set('y', Number(e.target.value))}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Horizontal pos (x %)</Label>
                            <Input
                                type="number" min="0" max="100" step="1"
                                value={field.x || 50}
                                onChange={e => set('x', Number(e.target.value))}
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Font size (pt)</Label>
                            <Input
                                type="number" min="6" max="72" step="1"
                                value={field.font_size || 12}
                                onChange={e => set('font_size', Number(e.target.value))}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Alignment</Label>
                            <Select value={field.align || 'center'} onValueChange={v => set('align', v)}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="center">Center</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <ColorInput label="Color" value={field.color} onChange={v => set('color', v)} />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`bold-${field.id}`}
                                checked={!!field.bold}
                                onCheckedChange={v => set('bold', !!v)}
                            />
                            <Label htmlFor={`bold-${field.id}`} className="text-xs font-bold cursor-pointer">Bold</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`italic-${field.id}`}
                                checked={!!field.italic}
                                onCheckedChange={v => set('italic', !!v)}
                            />
                            <Label htmlFor={`italic-${field.id}`} className="text-xs italic cursor-pointer">Italic</Label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main exported builder ──────────────────────────────────────────────────
export default function CertificateBuilder({ course, defaultTemplate, sections }) {
    const existing = course.certificate_template;
    const initial  = existing ?? defaultTemplate;

    const { data, setData, patch, processing, isDirty, errors, reset } = useForm({
        certificate_template: initial,
    });

    const tpl = data.certificate_template;
    function setTpl(updates) {
        setData('certificate_template', { ...tpl, ...updates });
    }
    function setNested(key, updates) {
        setTpl({ [key]: { ...tpl[key], ...updates } });
    }
    function updateField(id, updated) {
        setTpl({ fields: tpl.fields.map(f => f.id === id ? updated : f) });
    }

    function handleSubmit(e) {
        e.preventDefault();
        patch(route('admin.courses.certificate.update', course.id));
    }

    const reqType = tpl.requirements?.type || 'all_lessons';
    const allLessons = sections.flatMap(s => s.lessons.map(l => ({ ...l, sectionTitle: s.title })));

    return (
        <form onSubmit={handleSubmit}>
            <div className="flex flex-col xl:flex-row gap-6">

                {/* ── Settings panel ─────────────────────────────────── */}
                <div className="flex-1 min-w-0 space-y-2">

                    {/* Save / Reset bar */}
                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-[#8B1A4A]" />
                            <span className="text-sm font-semibold">Certificate Template</span>
                            {existing && (
                                <Badge variant="secondary" className="text-xs">Saved</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isDirty && (
                                <Button
                                    type="button" variant="ghost" size="sm"
                                    onClick={() => reset()}
                                    className="text-muted-foreground"
                                >
                                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            )}
                            <Button type="submit" size="sm" disabled={processing || !isDirty}
                                className="bg-[#8B1A4A] hover:bg-[#7a1740] text-white"
                            >
                                {processing
                                    ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving…</>
                                    : <><Check  className="mr-1.5 h-3.5 w-3.5" />Save Template</>}
                            </Button>
                        </div>
                    </div>

                    <Accordion type="multiple" defaultValue={['general', 'background', 'branding', 'fields', 'requirements']} className="space-y-2">

                        {/* ── General ── */}
                        <AccordionItem value="general" className="rounded-lg border px-4">
                            <AccordionTrigger className="py-3 hover:no-underline">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Settings2 className="h-4 w-4" />General Settings
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-4">
                                <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2">
                                    <Checkbox
                                        id="cert-enabled"
                                        checked={!!tpl.enabled}
                                        onCheckedChange={v => setTpl({ enabled: !!v })}
                                    />
                                    <div>
                                        <Label htmlFor="cert-enabled" className="cursor-pointer font-medium text-sm">
                                            Enable certificates for this course
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            When disabled, no certificate is generated on completion.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm">Page Size</Label>
                                        <Select value={tpl.size || 'a4'} onValueChange={v => setTpl({ size: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                                                <SelectItem value="letter">US Letter (216 × 279 mm)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm">Orientation</Label>
                                        <Select value={tpl.orientation || 'landscape'} onValueChange={v => setTpl({ orientation: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="landscape">Landscape</SelectItem>
                                                <SelectItem value="portrait">Portrait</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* ── Background ── */}
                        <AccordionItem value="background" className="rounded-lg border px-4">
                            <AccordionTrigger className="py-3 hover:no-underline">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Palette className="h-4 w-4" />Background
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Background Type</Label>
                                    <Select value={tpl.background?.type || 'color'} onValueChange={v => setNested('background', { type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="color">
                                                <div className="flex items-center gap-2"><Palette className="h-4 w-4" />Solid Color</div>
                                            </SelectItem>
                                            <SelectItem value="image">
                                                <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Image Upload</div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {tpl.background?.type !== 'image' ? (
                                    <ColorInput
                                        label="Background Color"
                                        value={tpl.background?.color || '#fdf8f4'}
                                        onChange={v => setNested('background', { color: v })}
                                    />
                                ) : (
                                    <div className="space-y-1.5">
                                        <Label className="text-sm">Background Image</Label>
                                        <ImageUploadWithUrl
                                            value={tpl.background?.image_url || ''}
                                            onChange={url => setNested('background', { image_url: url })}
                                            aspectRatio="h-36"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Recommended: 1920×1080 px or larger for best quality.
                                        </p>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        {/* ── Branding ── */}
                        <AccordionItem value="branding" className="rounded-lg border px-4">
                            <AccordionTrigger className="py-3 hover:no-underline">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Type className="h-4 w-4" />Branding & Colors
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3 rounded-md border p-3">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="show-top-bar"
                                                checked={!!(tpl.branding?.show_top_bar ?? true)}
                                                onCheckedChange={v => setNested('branding', { show_top_bar: !!v })}
                                            />
                                            <Label htmlFor="show-top-bar" className="cursor-pointer text-sm">Top Bar</Label>
                                        </div>
                                        <ColorInput
                                            label="Top Bar Color"
                                            value={tpl.branding?.top_bar_color || '#8B1A4A'}
                                            onChange={v => setNested('branding', { top_bar_color: v })}
                                        />
                                    </div>
                                    <div className="space-y-3 rounded-md border p-3">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="show-bottom-bar"
                                                checked={!!(tpl.branding?.show_bottom_bar ?? true)}
                                                onCheckedChange={v => setNested('branding', { show_bottom_bar: !!v })}
                                            />
                                            <Label htmlFor="show-bottom-bar" className="cursor-pointer text-sm">Bottom Bar</Label>
                                        </div>
                                        <ColorInput
                                            label="Bottom Bar Color"
                                            value={tpl.branding?.bottom_bar_color || '#8B1A4A'}
                                            onChange={v => setNested('branding', { bottom_bar_color: v })}
                                        />
                                    </div>
                                </div>

                                <ColorInput
                                    label="Accent / Divider Color"
                                    value={tpl.branding?.accent_color || '#C8A96E'}
                                    onChange={v => setNested('branding', { accent_color: v })}
                                />

                                <Separator />

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="show-logo"
                                        checked={!!(tpl.branding?.show_logo ?? true)}
                                        onCheckedChange={v => setNested('branding', { show_logo: !!v })}
                                    />
                                    <Label htmlFor="show-logo" className="cursor-pointer text-sm">Show logo text in top bar</Label>
                                </div>

                                {(tpl.branding?.show_logo ?? true) && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-sm">Logo Text</Label>
                                            <Input
                                                value={tpl.branding?.logo_text || ''}
                                                onChange={e => setNested('branding', { logo_text: e.target.value })}
                                                placeholder="FENLearn"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-sm">Tagline</Label>
                                            <Input
                                                value={tpl.branding?.tagline || ''}
                                                onChange={e => setNested('branding', { tagline: e.target.value })}
                                                placeholder="Your platform tagline"
                                            />
                                        </div>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        {/* ── Fields ── */}
                        <AccordionItem value="fields" className="rounded-lg border px-4">
                            <AccordionTrigger className="py-3 hover:no-underline">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Type className="h-4 w-4" />Text Fields & Placement
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-2">
                                <p className="text-xs text-muted-foreground mb-3">
                                    Toggle visibility, adjust vertical position (y%), and style each field. Static fields let you edit the text; dynamic fields pull data automatically.
                                </p>
                                {(tpl.fields || []).map(field => (
                                    <FieldRow
                                        key={field.id}
                                        field={field}
                                        onChange={updated => updateField(field.id, updated)}
                                    />
                                ))}
                            </AccordionContent>
                        </AccordionItem>

                        {/* ── Signatory ── */}
                        <AccordionItem value="signatory" className="rounded-lg border px-4">
                            <AccordionTrigger className="py-3 hover:no-underline">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <Users className="h-4 w-4" />Signatory
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    When filled, the signatory name and title are shown on the certificate. Enable the "Signatory Name" and "Signatory Title" fields above to control their placement.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm">Name</Label>
                                        <Input
                                            value={tpl.signatory?.name || ''}
                                            onChange={e => setNested('signatory', { name: e.target.value })}
                                            placeholder="e.g. Ahmad Farid"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm">Title / Role</Label>
                                        <Input
                                            value={tpl.signatory?.title || ''}
                                            onChange={e => setNested('signatory', { title: e.target.value })}
                                            placeholder="e.g. Programme Director"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Organization</Label>
                                    <Input
                                        value={tpl.signatory?.organization || ''}
                                        onChange={e => setNested('signatory', { organization: e.target.value })}
                                        placeholder="e.g. FEN Network"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* ── Requirements ── */}
                        <AccordionItem value="requirements" className="rounded-lg border px-4">
                            <AccordionTrigger className="py-3 hover:no-underline">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <BookOpen className="h-4 w-4" />Completion Requirements
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Certificate is awarded when the learner…</Label>
                                    <Select value={reqType} onValueChange={v => setNested('requirements', { type: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all_lessons">Completes all lessons in the course</SelectItem>
                                            <SelectItem value="percentage">Completes a minimum percentage of lessons</SelectItem>
                                            <SelectItem value="specific_sections">Completes all lessons in specific sections</SelectItem>
                                            <SelectItem value="specific_lessons">Completes specific lessons</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {reqType === 'percentage' && (
                                    <div className="space-y-1.5">
                                        <Label className="text-sm flex items-center gap-1.5">
                                            <Percent className="h-3.5 w-3.5" />Minimum completion percentage
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <Input
                                                type="number" min="1" max="100" step="1"
                                                value={tpl.requirements?.percentage || 80}
                                                onChange={e => setNested('requirements', { percentage: Number(e.target.value) })}
                                                className="w-24"
                                            />
                                            <span className="text-sm text-muted-foreground">% of all lessons</span>
                                        </div>
                                    </div>
                                )}

                                {reqType === 'specific_sections' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm">Required sections (all lessons must be completed)</Label>
                                        {sections.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">No sections yet — add sections to the curriculum first.</p>
                                        ) : (
                                            <div className="space-y-2 max-h-52 overflow-y-auto rounded-md border p-3">
                                                {sections.map(section => {
                                                    const selected = (tpl.requirements?.section_ids || []).includes(section.id);
                                                    return (
                                                        <div key={section.id} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={`sec-${section.id}`}
                                                                checked={selected}
                                                                onCheckedChange={checked => {
                                                                    const ids = tpl.requirements?.section_ids || [];
                                                                    setNested('requirements', {
                                                                        section_ids: checked
                                                                            ? [...ids, section.id]
                                                                            : ids.filter(id => id !== section.id),
                                                                    });
                                                                }}
                                                            />
                                                            <Label htmlFor={`sec-${section.id}`} className="cursor-pointer text-sm">
                                                                {section.title}
                                                                <span className="ml-1 text-xs text-muted-foreground">
                                                                    ({section.lessons?.length || 0} lessons)
                                                                </span>
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {reqType === 'specific_lessons' && (
                                    <div className="space-y-2">
                                        <Label className="text-sm">Required lessons</Label>
                                        {allLessons.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">No lessons yet — add lessons to the curriculum first.</p>
                                        ) : (
                                            <div className="space-y-1.5 max-h-52 overflow-y-auto rounded-md border p-3">
                                                {allLessons.map(lesson => {
                                                    const selected = (tpl.requirements?.lesson_ids || []).includes(lesson.id);
                                                    return (
                                                        <div key={lesson.id} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={`les-${lesson.id}`}
                                                                checked={selected}
                                                                onCheckedChange={checked => {
                                                                    const ids = tpl.requirements?.lesson_ids || [];
                                                                    setNested('requirements', {
                                                                        lesson_ids: checked
                                                                            ? [...ids, lesson.id]
                                                                            : ids.filter(id => id !== lesson.id),
                                                                    });
                                                                }}
                                                            />
                                                            <Label htmlFor={`les-${lesson.id}`} className="cursor-pointer text-sm">
                                                                {lesson.title}
                                                                <span className="ml-1 text-xs text-muted-foreground">— {lesson.sectionTitle}</span>
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {reqType === 'all_lessons' && (
                                    <p className="text-sm text-muted-foreground rounded-md bg-muted/30 px-3 py-2">
                                        The learner must complete every lesson in the course before receiving a certificate.
                                    </p>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </div>

                {/* ── Live Preview panel ─────────────────────────────── */}
                <div className="xl:w-[540px] shrink-0 space-y-3">
                    <div className="sticky top-4">
                        <div className="mb-2 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">Live Preview</span>
                            <Badge variant="outline" className="text-xs">
                                {(tpl.size || 'a4').toUpperCase()} · {tpl.orientation || 'landscape'}
                            </Badge>
                        </div>
                        <CertPreview template={tpl} courseTitle={course.title} />
                        <p className="mt-2 text-xs text-muted-foreground">
                            Preview uses sample data. The actual PDF renders using the learner's real information.
                        </p>
                    </div>
                </div>

            </div>
        </form>
    );
}
