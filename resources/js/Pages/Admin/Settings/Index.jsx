import { useState, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Palette,
    Users,
    Globe,
    Mail,
    BarChart3,
    ScrollText,
    Award,
    Wrench,
    Upload,
    Type,
    Trash2,
    X,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    ShieldCheck,
    Lock,
    Unlock,
} from 'lucide-react';

function SuccessBanner({ message }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="h-4 w-4 shrink-0" />
            {message}
        </div>
    );
}

function ErrorBanner({ message }) {
    if (!message) return null;
    return (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {message}
        </div>
    );
}

function SwitchRow({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">{label}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    checked ? 'bg-primary' : 'bg-input'
                }`}
            >
                <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
            </button>
        </div>
    );
}

function ImageUploadField({ label, description, currentUrl, onFileChange, onClear, accept = 'image/*' }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    function handleFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        onFileChange(file);
    }

    function handleClear() {
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
        onClear();
    }

    const displayUrl = preview || currentUrl;

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            <div className="flex items-start gap-4">
                {displayUrl ? (
                    <div className="relative">
                        <img
                            src={displayUrl}
                            alt={label}
                            className="h-16 w-16 rounded-lg border object-contain bg-muted"
                        />
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-destructive-foreground shadow"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ) : (
                    <div
                        className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                )}
                <div className="space-y-1.5">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="mr-2 h-3.5 w-3.5" />
                        {displayUrl ? 'Replace' : 'Upload'}
                    </Button>
                    {displayUrl && (
                        <p className="text-xs text-muted-foreground">Click ✕ to remove</p>
                    )}
                </div>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFile}
            />
        </div>
    );
}

function PlaceholderChips({ tokens }) {
    if (!tokens?.length) return null;

    return (
        <div className="mt-1 flex flex-wrap gap-1.5">
            {tokens.map(token => (
                <span
                    key={token}
                    className="inline-flex items-center rounded-full border border-muted-foreground/30 bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                    {`{{${token}}}`}
                </span>
            ))}
        </div>
    );
}

export default function SettingsIndex({ settings, customFonts = [] }) {
    const { flash, errors = {} } = usePage().props;
    const [processing, setProcessing] = useState(false);

    function submitGroup(group, data, files = {}) {
        const formData = new FormData();
        formData.append('_group', group);
        Object.entries(data).forEach(([k, v]) => {
            if (v !== null && v !== undefined) formData.append(k, v);
        });
        Object.entries(files).forEach(([k, v]) => {
            if (v) formData.append(k, v);
        });

        setProcessing(true);
        router.post(route('admin.settings.update'), formData, {
            forceFormData: true,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <AdminLayout title="Settings">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage platform configuration across all areas.
                    </p>
                </div>

                {flash?.success && <SuccessBanner message={flash.success} />}
                {flash?.error && <ErrorBanner message={flash.error} />}

                <Tabs defaultValue="branding">
                    <TabsList className="flex flex-wrap h-auto gap-1 mb-2">
                        <TabsTrigger value="branding" className="gap-1.5">
                            <Palette className="h-3.5 w-3.5" />Branding
                        </TabsTrigger>
                        <TabsTrigger value="access" className="gap-1.5">
                            <Users className="h-3.5 w-3.5" />Registration
                        </TabsTrigger>
                        <TabsTrigger value="localization" className="gap-1.5">
                            <Globe className="h-3.5 w-3.5" />Localization
                        </TabsTrigger>
                        <TabsTrigger value="email" className="gap-1.5">
                            <Mail className="h-3.5 w-3.5" />Email / SMTP
                        </TabsTrigger>
                        <TabsTrigger value="certificates" className="gap-1.5">
                            <Award className="h-3.5 w-3.5" />Certificates
                        </TabsTrigger>
                        <TabsTrigger value="fonts" className="gap-1.5">
                            <Type className="h-3.5 w-3.5" />Fonts
                        </TabsTrigger>
                        <TabsTrigger value="maintenance" className="gap-1.5">
                            <Wrench className="h-3.5 w-3.5" />Maintenance
                        </TabsTrigger>
                        <TabsTrigger value="role_access" className="gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5" />Role Access
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-1.5">
                            <Lock className="h-3.5 w-3.5" />Security
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="gap-1.5">
                            <BarChart3 className="h-3.5 w-3.5" />Analytics
                        </TabsTrigger>
                        <TabsTrigger value="logging" className="gap-1.5">
                            <ScrollText className="h-3.5 w-3.5" />Logging
                        </TabsTrigger>
                    </TabsList>

                    {/* ── BRANDING ── */}
                    <TabsContent value="branding">
                        <BrandingTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>

                    {/* ── REGISTRATION & ACCESS ── */}
                    <TabsContent value="access">
                        <AccessTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>

                    {/* ── LOCALIZATION ── */}
                    <TabsContent value="localization">
                        <LocalizationTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>

                    {/* ── EMAIL / SMTP ── */}
                    <TabsContent value="email">
                        <EmailTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>

                    {/* ── CERTIFICATES ── */}
                    <TabsContent value="certificates">
                        <CertificatesTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>

                    {/* ── CUSTOM FONTS ── */}
                    <TabsContent value="fonts">
                        <FontsTab customFonts={customFonts} processing={processing} errors={errors} />
                    </TabsContent>

                    {/* ── MAINTENANCE ── */}
                    <TabsContent value="maintenance">
                        <MaintenanceTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>

                    {/* ── ROLE ACCESS ── */}
                    <TabsContent value="role_access">
                        <RoleAccessTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>

                    {/* ── SECURITY ── */}
                    <TabsContent value="security">
                        <SecurityTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>

                    {/* ── ANALYTICS ── */}
                    <TabsContent value="analytics">
                        <AnalyticsTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>

                    {/* ── LOGGING ── */}
                    <TabsContent value="logging">
                        <LoggingTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}

function SecurityTab({ settings, onSave, processing }) {
    const [provider, setProvider] = useState(settings.captcha_provider || 'none');
    const [enabledLogin, setEnabledLogin] = useState(settings.captcha_enabled_login === '1');
    const [enabledRegister, setEnabledRegister] = useState(settings.captcha_enabled_register === '1');
    const [enabledForgotPassword, setEnabledForgotPassword] = useState(settings.captcha_enabled_forgot_password === '1');
    const [siteKey, setSiteKey] = useState(settings.captcha_site_key || '');
    const [secretKey, setSecretKey] = useState('');
    const [clearSecret, setClearSecret] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [minScore, setMinScore] = useState(settings.captcha_min_score || '0.5');

    const hasSavedSecret = Boolean(settings.captcha_secret_key);
    const captchaEnabled = provider !== 'none';

    function save() {
        onSave('security', {
            captcha_provider: provider,
            captcha_enabled_login: enabledLogin ? '1' : '0',
            captcha_enabled_register: enabledRegister ? '1' : '0',
            captcha_enabled_forgot_password: enabledForgotPassword ? '1' : '0',
            captcha_site_key: siteKey,
            captcha_secret_key: secretKey,
            clear_captcha_secret_key: clearSecret ? '1' : '0',
            captcha_min_score: minScore,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Captcha Security
                </CardTitle>
                <CardDescription>
                    Configure bot protection for authentication forms using Cloudflare Turnstile or Google reCAPTCHA.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Captcha Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                        <SelectTrigger className="w-64">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Disabled</SelectItem>
                            <SelectItem value="turnstile">Cloudflare Turnstile</SelectItem>
                            <SelectItem value="recaptcha">Google reCAPTCHA v3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {captchaEnabled && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="captcha_site_key">Site Key</Label>
                                <Input
                                    id="captcha_site_key"
                                    value={siteKey}
                                    onChange={(e) => setSiteKey(e.target.value)}
                                    placeholder="Public site key"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="captcha_secret_key">Secret Key</Label>
                                <div className="relative">
                                    <Input
                                        id="captcha_secret_key"
                                        type={showSecret ? 'text' : 'password'}
                                        value={secretKey}
                                        onChange={(e) => {
                                            setSecretKey(e.target.value);
                                            if (e.target.value !== '') {
                                                setClearSecret(false);
                                            }
                                        }}
                                        placeholder={hasSavedSecret ? 'Leave blank to keep existing secret' : 'Secret key'}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSecret(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        checked={clearSecret}
                                        onChange={(e) => {
                                            setClearSecret(e.target.checked);
                                            if (e.target.checked) {
                                                setSecretKey('');
                                            }
                                        }}
                                    />
                                    Clear stored secret key on save
                                </label>
                            </div>
                        </div>

                        {provider === 'recaptcha' && (
                            <div className="space-y-2">
                                <Label htmlFor="captcha_min_score">Minimum Score (0.0 to 1.0)</Label>
                                <Input
                                    id="captcha_min_score"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={minScore}
                                    onChange={(e) => setMinScore(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                        )}
                    </>
                )}

                <Separator />

                <div className="space-y-3">
                    <p className="text-sm font-medium">Protected Forms</p>
                    <SwitchRow
                        label="Login form"
                        description="Require captcha verification before sign-in."
                        checked={enabledLogin}
                        onChange={setEnabledLogin}
                    />
                    <SwitchRow
                        label="Registration form"
                        description="Require captcha verification before account creation."
                        checked={enabledRegister}
                        onChange={setEnabledRegister}
                    />
                    <SwitchRow
                        label="Forgot password form"
                        description="Require captcha verification before reset link requests."
                        checked={enabledForgotPassword}
                        onChange={setEnabledForgotPassword}
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={save} disabled={processing}>Save Security Settings</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function AnalyticsTab({ settings, onSave, processing }) {
    const [enabled, setEnabled] = useState(settings.analytics_enabled === '1');
    const [measurementId, setMeasurementId] = useState(settings.ga4_measurement_id || '');
    const [anonymizeIp, setAnonymizeIp] = useState(settings.ga4_anonymize_ip !== '0');
    const [debugMode, setDebugMode] = useState(settings.ga4_debug_mode === '1');

    function save() {
        onSave('analytics', {
            analytics_enabled: enabled ? '1' : '0',
            ga4_measurement_id: measurementId,
            ga4_anonymize_ip: anonymizeIp ? '1' : '0',
            ga4_debug_mode: debugMode ? '1' : '0',
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" /> Google Analytics (GA4)
                </CardTitle>
                <CardDescription>
                    Configure GA4 tracking and privacy options for the platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SwitchRow
                    label="Enable Analytics"
                    description="Inject GA4 tracking script on frontend pages when configured."
                    checked={enabled}
                    onChange={setEnabled}
                />

                <div className="space-y-2">
                    <Label htmlFor="ga4_measurement_id">GA4 Measurement ID</Label>
                    <Input
                        id="ga4_measurement_id"
                        value={measurementId}
                        onChange={(e) => setMeasurementId(e.target.value.toUpperCase())}
                        placeholder="G-XXXXXXXXXX"
                        className="max-w-xs"
                    />
                    <p className="text-xs text-muted-foreground">Format: G-XXXXXXXXXX</p>
                </div>

                <SwitchRow
                    label="Anonymize IP"
                    description="Mask visitor IP addresses for privacy-sensitive analytics reporting."
                    checked={anonymizeIp}
                    onChange={setAnonymizeIp}
                />

                <SwitchRow
                    label="Debug Mode"
                    description="Enable debug-friendly analytics behavior for troubleshooting setups."
                    checked={debugMode}
                    onChange={setDebugMode}
                />

                <div className="flex justify-end pt-2">
                    <Button onClick={save} disabled={processing}>Save Analytics Settings</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function LoggingTab({ settings, onSave, processing }) {
    const [enabled, setEnabled] = useState(settings.system_logging_enabled !== '0');
    const [level, setLevel] = useState(settings.system_log_level || 'info');
    const [retentionDays, setRetentionDays] = useState(settings.system_log_retention_days || '180');
    const [captureContext, setCaptureContext] = useState(settings.system_log_capture_context !== '0');
    const [redactionEnabled, setRedactionEnabled] = useState(settings.system_log_redaction_enabled !== '0');
    const [redactedKeys, setRedactedKeys] = useState(
        settings.system_log_redacted_keys || 'email,password,token,secret,authorization,cookie,set-cookie,api_key,api-key,captcha_secret_key,mail_password'
    );

    function save() {
        onSave('logging', {
            system_logging_enabled: enabled ? '1' : '0',
            system_log_level: level,
            system_log_retention_days: retentionDays,
            system_log_capture_context: captureContext ? '1' : '0',
            system_log_redaction_enabled: redactionEnabled ? '1' : '0',
            system_log_redacted_keys: redactedKeys,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4" /> System Logging
                </CardTitle>
                <CardDescription>
                    Configure system log generation policy and retention defaults.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SwitchRow
                    label="Enable System Logging"
                    description="Write technical operational logs for platform monitoring and troubleshooting."
                    checked={enabled}
                    onChange={setEnabled}
                />

                <div className="space-y-2">
                    <Label>Log Level</Label>
                    <Select value={level} onValueChange={setLevel}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="debug">Debug</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="system_log_retention_days">Retention (days)</Label>
                    <Input
                        id="system_log_retention_days"
                        type="number"
                        min="1"
                        max="3650"
                        value={retentionDays}
                        onChange={(e) => setRetentionDays(e.target.value)}
                        className="w-40"
                    />
                </div>

                <SwitchRow
                    label="Capture Request Context"
                    description="Include metadata such as request ID, route, and user identifiers in logs."
                    checked={captureContext}
                    onChange={setCaptureContext}
                />

                <SwitchRow
                    label="Redact Sensitive Fields"
                    description="Mask sensitive keys in system log context for both admin UI and exports."
                    checked={redactionEnabled}
                    onChange={setRedactionEnabled}
                />

                <div className="space-y-2">
                    <Label htmlFor="system_log_redacted_keys">Redacted keys (comma separated)</Label>
                    <Input
                        id="system_log_redacted_keys"
                        value={redactedKeys}
                        onChange={(e) => setRedactedKeys(e.target.value)}
                        placeholder="email,password,token,secret,authorization"
                    />
                    <p className="text-xs text-muted-foreground">
                        Example keys: email, password, token, secret, authorization, cookie.
                    </p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={save} disabled={processing}>Save Logging Settings</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function FontsTab({ customFonts, processing, errors = {} }) {
    const [name, setName] = useState('');
    const [family, setFamily] = useState('');
    const [regularFile, setRegularFile] = useState(null);
    const [boldFile, setBoldFile] = useState(null);
    const [italicFile, setItalicFile] = useState(null);
    const [boldItalicFile, setBoldItalicFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    function upload() {
        const formData = new FormData();
        if (name?.trim()) formData.append('name', name.trim());
        formData.append('family', family);
        if (regularFile) formData.append('regular_file', regularFile);
        if (boldFile) formData.append('bold_file', boldFile);
        if (italicFile) formData.append('italic_file', italicFile);
        if (boldItalicFile) formData.append('bold_italic_file', boldItalicFile);

        router.post(route('admin.settings.fonts.store'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => setUploading(true),
            onSuccess: () => {
                setName('');
                setFamily('');
                setRegularFile(null);
                setBoldFile(null);
                setItalicFile(null);
                setBoldItalicFile(null);
            },
            onFinish: () => setUploading(false),
        });
    }

    const fontUploadError = [
        errors.name,
        errors.family,
        errors.regular_file,
        errors.bold_file,
        errors.italic_file,
        errors.bold_italic_file,
    ].find(Boolean);

    function removeFont(id) {
        router.delete(route('admin.settings.fonts.destroy', id), {
            preserveScroll: true,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Type className="h-4 w-4" /> Custom Fonts
                </CardTitle>
                <CardDescription>
                    Upload custom TTF/OTF fonts for certificate generation. These fonts will be available in the certificate builder.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="font_name">Font Name (optional)</Label>
                        <Input id="font_name" value={name} onChange={e => setName(e.target.value)} placeholder="Auto from file name if blank" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="font_family">CSS Family Name</Label>
                        <Input id="font_family" value={family} onChange={e => setFamily(e.target.value)} placeholder="e.g. Montserrat" />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="font_regular">Regular Font File (required)</Label>
                        <Input id="font_regular" type="file" accept=".ttf,.otf" onChange={e => setRegularFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="font_bold">Bold Font File (optional)</Label>
                        <Input id="font_bold" type="file" accept=".ttf,.otf" onChange={e => setBoldFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="font_italic">Italic Font File (optional)</Label>
                        <Input id="font_italic" type="file" accept=".ttf,.otf" onChange={e => setItalicFile(e.target.files?.[0] || null)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="font_bold_italic">Bold Italic Font File (optional)</Label>
                        <Input id="font_bold_italic" type="file" accept=".ttf,.otf" onChange={e => setBoldItalicFile(e.target.files?.[0] || null)} />
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    Accepted formats: <code>.ttf</code>, <code>.otf</code>. Max size 5MB per file. Upload variants to improve bold/italic rendering in PDF certificates.
                </p>

                {fontUploadError && <ErrorBanner message={fontUploadError} />}

                <div className="flex justify-end">
                    <Button onClick={upload} disabled={processing || uploading || !regularFile}>Upload Font</Button>
                </div>

                <Separator />

                <div className="space-y-3">
                    <p className="text-sm font-medium">Uploaded Fonts</p>
                    {customFonts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No custom fonts uploaded yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {customFonts.map(font => {
                                const hasBold = !!font.bold_path;
                                const hasItalic = !!font.italic_path;
                                const hasBoldItalic = !!font.bold_italic_path;

                                return (
                                    <div key={font.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div>
                                            <p className="text-sm font-semibold">{font.name}</p>
                                            <p className="text-xs text-muted-foreground">Family: {font.family || font.name}</p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                <Badge variant="outline" className="text-[10px]">Regular</Badge>
                                                {hasBold && <Badge variant="outline" className="text-[10px]">Bold</Badge>}
                                                {hasItalic && <Badge variant="outline" className="text-[10px]">Italic</Badge>}
                                                {hasBoldItalic && <Badge variant="outline" className="text-[10px]">Bold Italic</Badge>}
                                            </div>
                                        </div>
                                        <Button variant="destructive" size="sm" onClick={() => removeFont(font.id)}>
                                            <Trash2 className="mr-1 h-3.5 w-3.5" />Delete
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function BrandingTab({ settings, onSave, processing }) {
    const [name, setName] = useState(settings.platform_name || '');
    const [tagline, setTagline] = useState(settings.platform_tagline || '');
    const [contactEmail, setContactEmail] = useState(settings.contact_email || '');
    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);
    const [clearLogo, setClearLogo] = useState(false);
    const [clearFavicon, setClearFavicon] = useState(false);

    function handleLogoChange(file) { setLogoFile(file); setClearLogo(false); }
    function handleLogoClear() { setLogoFile(null); setClearLogo(true); }
    function handleFaviconChange(file) { setFaviconFile(file); setClearFavicon(false); }
    function handleFaviconClear() { setFaviconFile(null); setClearFavicon(true); }

    function save() {
        onSave(
            'branding',
            {
                platform_name: name,
                platform_tagline: tagline,
                contact_email: contactEmail,
                clear_logo: clearLogo ? '1' : undefined,
                clear_favicon: clearFavicon ? '1' : undefined,
            },
            {
                logo: logoFile,
                favicon: faviconFile,
            }
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Platform &amp; Branding
                </CardTitle>
                <CardDescription>
                    Customize the name, tagline, and visual identity of your platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="platform_name">Platform Name</Label>
                    <Input
                        id="platform_name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Free LMS"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="platform_tagline">Tagline</Label>
                    <Input
                        id="platform_tagline"
                        value={tagline}
                        onChange={e => setTagline(e.target.value)}
                        placeholder="Learn anything, anywhere."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact / Support Email</Label>
                    <Input
                        id="contact_email"
                        type="email"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        placeholder="support@example.com"
                    />
                </div>

                <Separator />

                <ImageUploadField
                    label="Logo"
                    description="Recommended: PNG or SVG, at least 200×60 px."
                    currentUrl={settings.logo_path ? `/storage/${settings.logo_path}` : null}
                    onFileChange={handleLogoChange}
                    onClear={handleLogoClear}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                />

                <ImageUploadField
                    label="Favicon"
                    description="Recommended: PNG or ICO, 32×32 px."
                    currentUrl={settings.favicon_path ? `/storage/${settings.favicon_path}` : null}
                    onFileChange={handleFaviconChange}
                    onClear={handleFaviconClear}
                    accept="image/png,image/x-icon,image/jpeg"
                />

                <div className="flex justify-end pt-2">
                    <Button onClick={save} disabled={processing}>Save Branding</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function AccessTab({ settings, onSave, processing }) {
    const [allowReg, setAllowReg] = useState(settings.allow_registration === '1');
    const [defaultRole, setDefaultRole] = useState(settings.default_role || 'learner');
    const [requireVerify, setRequireVerify] = useState(settings.require_email_verification === '1');

    function save() {
        onSave('access', {
            allow_registration:         allowReg ? '1' : '0',
            default_role:               defaultRole,
            require_email_verification: requireVerify ? '1' : '0',
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Registration &amp; Access
                </CardTitle>
                <CardDescription>
                    Control who can sign up and what role they receive by default.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SwitchRow
                    label="Allow Public Self-Registration"
                    description="When off, only admins can create new accounts."
                    checked={allowReg}
                    onChange={setAllowReg}
                />

                <div className="space-y-2">
                    <Label>Default Role on Registration</Label>
                    <Select value={defaultRole} onValueChange={setDefaultRole}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="learner">Learner</SelectItem>
                            <SelectItem value="content_editor">Content Editor</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        The role automatically assigned when a new user registers.
                    </p>
                </div>

                <SwitchRow
                    label="Require Email Verification"
                    description="Users must verify their email before accessing the platform."
                    checked={requireVerify}
                    onChange={setRequireVerify}
                />

                <div className="flex justify-end pt-2">
                    <Button onClick={save} disabled={processing}>Save Access Settings</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function LocalizationTab({ settings, onSave, processing }) {
    const [locale, setLocale] = useState(settings.default_locale || 'en');

    function save() {
        onSave('localization', { default_locale: locale });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Localization
                </CardTitle>
                <CardDescription>
                    Set the default language for new visitors and users who haven't chosen a preference.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Default Platform Language</Label>
                    <Select value={locale} onValueChange={setLocale}>
                        <SelectTrigger className="w-56">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English (EN)</SelectItem>
                            <SelectItem value="ms">Bahasa Melayu (BM)</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        Individual users can still switch languages using the language switcher.
                    </p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={save} disabled={processing}>Save Localization</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function EmailTab({ settings, onSave, processing }) {
    const [driver, setDriver] = useState(settings.mail_driver || 'smtp');
    const [host, setHost] = useState(settings.mail_host || '');
    const [port, setPort] = useState(settings.mail_port || '587');
    // Map legacy 'tls'/'ssl' values stored in DB to Symfony Mailer scheme names.
    const normalizeScheme = (v) => v === 'tls' ? 'smtp' : v === 'ssl' ? 'smtps' : (v || 'none');
    const [scheme, setScheme] = useState(normalizeScheme(settings.mail_scheme));
    const [username, setUsername] = useState(settings.mail_username || '');
    const [password, setPassword] = useState('');
    const [clearPassword, setClearPassword] = useState(false);
    const [senderName, setSenderName] = useState(settings.mail_sender_name || '');
    const [senderAddress, setSenderAddress] = useState(settings.mail_sender_address || '');
    const [invitationSubject, setInvitationSubject] = useState(settings.invitation_email_subject || "You've been invited to join {{platform_name}}");
    const [invitationTitle, setInvitationTitle] = useState(settings.invitation_email_title || "You're invited to join the team");
    const [invitationBody, setInvitationBody] = useState(settings.invitation_email_body || '{{inviter_name}} has invited you to join {{platform_name}} as a {{role_label}}.');
    const [invitationCta, setInvitationCta] = useState(settings.invitation_email_cta || 'Accept Invitation');
    const [verificationSubject, setVerificationSubject] = useState(settings.verification_email_subject || 'Verify your email address');
    const [verificationTitle, setVerificationTitle] = useState(settings.verification_email_title || 'Verify your email address');
    const [verificationBody, setVerificationBody] = useState(settings.verification_email_body || 'Please confirm your email address for {{platform_name}} by clicking the button below.');
    const [verificationCta, setVerificationCta] = useState(settings.verification_email_cta || 'Verify Email Address');
    const [resetSubject, setResetSubject] = useState(settings.reset_email_subject || 'Reset your password');
    const [resetTitle, setResetTitle] = useState(settings.reset_email_title || 'Reset your password');
    const [resetBody, setResetBody] = useState(settings.reset_email_body || 'We received a request to reset your password for {{platform_name}}.');
    const [resetCta, setResetCta] = useState(settings.reset_email_cta || 'Reset Password');
    const [testRecipient, setTestRecipient] = useState(settings.mail_sender_address || '');
    const [showPassword, setShowPassword] = useState(false);
    const [activeSection, setActiveSection] = useState('smtp');

    function save() {
        onSave('email', {
            mail_driver:         driver,
            mail_host:           host,
            mail_port:           port,
            mail_scheme:         scheme,
            mail_username:       username,
            mail_password:       password,
            clear_mail_password: clearPassword ? '1' : '0',
            mail_sender_name:    senderName,
            mail_sender_address: senderAddress,
            invitation_email_subject: invitationSubject,
            invitation_email_title: invitationTitle,
            invitation_email_body: invitationBody,
            invitation_email_cta: invitationCta,
            verification_email_subject: verificationSubject,
            verification_email_title: verificationTitle,
            verification_email_body: verificationBody,
            verification_email_cta: verificationCta,
            reset_email_subject: resetSubject,
            reset_email_title: resetTitle,
            reset_email_body: resetBody,
            reset_email_cta: resetCta,
        });
    }

    function sendTestEmail() {
        router.post(route('admin.settings.test-email'), {
            recipient: testRecipient,
        }, {
            preserveScroll: true,
        });
    }

    function sendTemplateTestEmail(type) {
        router.post(route('admin.settings.test-email-template', type), {
            recipient: testRecipient,
        }, {
            preserveScroll: true,
        });
    }

    const emailSections = [
        { id: 'smtp', label: 'SMTP & Sender' },
        { id: 'invitation', label: 'Staff Invitation' },
        { id: 'verification', label: 'Email Verification' },
        { id: 'reset', label: 'Password Reset' },
        { id: 'test', label: 'Test Email' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email / SMTP
                </CardTitle>
                <CardDescription>
                    Configure outbound email and customize each email template in dedicated sections.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
                    <div className="space-y-1 rounded-lg border p-2 h-fit">
                        {emailSections.map(section => (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                    activeSection === section.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-lg border p-4 sm:p-5">
                        {activeSection === 'smtp' && (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label>Mail Driver</Label>
                                    <Select value={driver} onValueChange={setDriver}>
                                        <SelectTrigger className="w-48">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="smtp">SMTP</SelectItem>
                                            <SelectItem value="sendmail">Sendmail</SelectItem>
                                            <SelectItem value="log">Log (dev only)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {driver === 'smtp' && (
                                    <>
                                        <Separator />
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div className="col-span-2 space-y-2">
                                                <Label htmlFor="mail_host">SMTP Host</Label>
                                                <Input
                                                    id="mail_host"
                                                    value={host}
                                                    onChange={e => setHost(e.target.value)}
                                                    placeholder="smtp.example.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="mail_port">Port</Label>
                                                <Input
                                                    id="mail_port"
                                                    type="number"
                                                    value={port}
                                                    onChange={e => setPort(e.target.value)}
                                                    placeholder="587"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Encryption / Scheme</Label>
                                            <Select value={scheme} onValueChange={setScheme}>
                                                <SelectTrigger className="w-64">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="smtp">TLS (STARTTLS, port 587)</SelectItem>
                                                    <SelectItem value="smtps">SMTPS (SSL, port 465)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mail_username">Username</Label>
                                            <Input
                                                id="mail_username"
                                                value={username}
                                                onChange={e => setUsername(e.target.value)}
                                                placeholder="user@example.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="mail_password">Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="mail_password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    placeholder="Leave blank to keep existing password"
                                                    className="pr-10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <label className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                                                <input
                                                    type="checkbox"
                                                    checked={clearPassword}
                                                    onChange={e => setClearPassword(e.target.checked)}
                                                />
                                                Clear saved SMTP password on save
                                            </label>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="mail_sender_name">Sender Name</Label>
                                        <Input
                                            id="mail_sender_name"
                                            value={senderName}
                                            onChange={e => setSenderName(e.target.value)}
                                            placeholder="My LMS"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mail_sender_address">Sender Address</Label>
                                        <Input
                                            id="mail_sender_address"
                                            type="email"
                                            value={senderAddress}
                                            onChange={e => setSenderAddress(e.target.value)}
                                            placeholder="no-reply@example.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'invitation' && (
                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    Supported placeholders: {'{{platform_name}}'}, {'{{inviter_name}}'}, {'{{role_label}}'}
                                </p>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Subject</Label>
                                        <Input value={invitationSubject} onChange={e => setInvitationSubject(e.target.value)} />
                                        <PlaceholderChips tokens={["platform_name", "inviter_name", "role_label"]} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Button text</Label>
                                        <Input value={invitationCta} onChange={e => setInvitationCta(e.target.value)} />
                                        <PlaceholderChips tokens={["platform_name", "inviter_name", "role_label"]} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={invitationTitle} onChange={e => setInvitationTitle(e.target.value)} />
                                    <PlaceholderChips tokens={["platform_name", "inviter_name", "role_label"]} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Body</Label>
                                    <textarea
                                        className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={invitationBody}
                                        onChange={e => setInvitationBody(e.target.value)}
                                    />
                                    <PlaceholderChips tokens={["platform_name", "inviter_name", "role_label"]} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Test Recipient Email</Label>
                                    <Input
                                        type="email"
                                        value={testRecipient}
                                        onChange={e => setTestRecipient(e.target.value)}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="outline" onClick={() => sendTemplateTestEmail('invitation')} disabled={processing}>
                                        Send Invitation Test
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'verification' && (
                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    Supported placeholders: {'{{platform_name}}'}
                                </p>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Subject</Label>
                                        <Input value={verificationSubject} onChange={e => setVerificationSubject(e.target.value)} />
                                        <PlaceholderChips tokens={["platform_name"]} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Button text</Label>
                                        <Input value={verificationCta} onChange={e => setVerificationCta(e.target.value)} />
                                        <PlaceholderChips tokens={["platform_name"]} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={verificationTitle} onChange={e => setVerificationTitle(e.target.value)} />
                                    <PlaceholderChips tokens={["platform_name"]} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Body</Label>
                                    <textarea
                                        className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={verificationBody}
                                        onChange={e => setVerificationBody(e.target.value)}
                                    />
                                    <PlaceholderChips tokens={["platform_name"]} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Test Recipient Email</Label>
                                    <Input
                                        type="email"
                                        value={testRecipient}
                                        onChange={e => setTestRecipient(e.target.value)}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="outline" onClick={() => sendTemplateTestEmail('verification')} disabled={processing}>
                                        Send Verification Test
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'reset' && (
                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    Supported placeholders: {'{{platform_name}}'}
                                </p>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Subject</Label>
                                        <Input value={resetSubject} onChange={e => setResetSubject(e.target.value)} />
                                        <PlaceholderChips tokens={["platform_name"]} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Button text</Label>
                                        <Input value={resetCta} onChange={e => setResetCta(e.target.value)} />
                                        <PlaceholderChips tokens={["platform_name"]} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={resetTitle} onChange={e => setResetTitle(e.target.value)} />
                                    <PlaceholderChips tokens={["platform_name"]} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Body</Label>
                                    <textarea
                                        className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                                        value={resetBody}
                                        onChange={e => setResetBody(e.target.value)}
                                    />
                                    <PlaceholderChips tokens={["platform_name"]} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Test Recipient Email</Label>
                                    <Input
                                        type="email"
                                        value={testRecipient}
                                        onChange={e => setTestRecipient(e.target.value)}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="outline" onClick={() => sendTemplateTestEmail('reset')} disabled={processing}>
                                        Send Reset Test
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'test' && (
                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    Use this to confirm SMTP delivery with your current configuration. Template test buttons are also available on each template section.
                                </p>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="test_recipient">Test Recipient Email</Label>
                                        <Input
                                            id="test_recipient"
                                            type="email"
                                            value={testRecipient}
                                            onChange={e => setTestRecipient(e.target.value)}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button variant="outline" onClick={sendTestEmail} className="w-full" disabled={processing}>
                                            Send Test Email
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={save} disabled={processing}>Save Email Settings</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function CertificatesTab({ settings, onSave, processing }) {
    const [enabled, setEnabled] = useState(settings.certificates_enabled === '1');

    function save() {
        onSave('certificates', { certificates_enabled: enabled ? '1' : '0' });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="h-4 w-4" /> Certificates
                </CardTitle>
                <CardDescription>
                    Control certificate generation platform-wide. Per-course settings in the Certificate Builder take precedence.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SwitchRow
                    label="Enable Certificates"
                    description="When disabled, no certificates will be generated or downloadable, regardless of course settings."
                    checked={enabled}
                    onChange={setEnabled}
                />

                {!enabled && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Certificates are disabled. Learners who complete courses will not receive a certificate.
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button onClick={save} disabled={processing}>Save Certificate Settings</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function MaintenanceTab({ settings, onSave, processing }) {
    const [enabled, setEnabled] = useState(settings.maintenance_mode === '1');
    const [message, setMessage] = useState(settings.maintenance_message || '');

    function save() {
        onSave('maintenance', {
            maintenance_mode:    enabled ? '1' : '0',
            maintenance_message: message,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" /> Maintenance
                </CardTitle>
                <CardDescription>
                    Take the site offline for non-admin users with a custom message.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SwitchRow
                    label="Maintenance Mode"
                    description="When on, learners and guests see a maintenance page. Admins are unaffected."
                    checked={enabled}
                    onChange={setEnabled}
                />

                {enabled && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>
                            <strong>Maintenance mode is active.</strong> Non-admin users cannot access the platform.
                        </span>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="maintenance_message">Maintenance Message</Label>
                    <textarea
                        id="maintenance_message"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="We are currently down for scheduled maintenance. Please check back soon."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={save}
                        disabled={processing}
                        variant={enabled ? 'destructive' : 'default'}
                    >
                        {enabled ? 'Save (Maintenance Active)' : 'Save Maintenance Settings'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function PermissionRow({ icon: Icon, label, description, state }) {
    const isOn     = state === 'on';
    const isOff    = state === 'off';
    const isAlways = state === 'always';
    const isNever  = state === 'never';

    return (
        <div className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-start gap-3 min-w-0">
                {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
                <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{label}</p>
                    {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
                </div>
            </div>
            <div className="shrink-0">
                {isAlways && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" /> Always
                    </span>
                )}
                {isNever && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        <Lock className="h-3 w-3" /> Never
                    </span>
                )}
                {(isOn || isOff) && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        isOn
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                    }`}>
                        {isOn
                            ? <><Unlock className="h-3 w-3" /> Allowed</>
                            : <><Lock className="h-3 w-3" /> Restricted</>
                        }
                    </span>
                )}
            </div>
        </div>
    );
}

function RoleAccessTab({ settings, onSave, processing }) {
    const [learnerCanEnroll, setLearnerCanEnroll]               = useState(settings.learner_can_enroll !== '0');
    const [editorCanManageUsers, setEditorCanManageUsers]       = useState(settings.editor_can_manage_users !== '0');
    const [editorCanAccessSettings, setEditorCanAccessSettings] = useState(settings.editor_can_access_settings !== '0');

    function save() {
        onSave('role_access', {
            learner_can_enroll:         learnerCanEnroll ? '1' : '0',
            editor_can_manage_users:    editorCanManageUsers ? '1' : '0',
            editor_can_access_settings: editorCanAccessSettings ? '1' : '0',
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Role Access
                </CardTitle>
                <CardDescription>
                    Control what each role is permitted to do on the platform.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* ── Learner ── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                            <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Learner</h3>
                        <span className="text-xs text-muted-foreground">default role for all new registrations</span>
                    </div>
                    <div className="divide-y rounded-lg border px-4">
                        <PermissionRow
                            label="Browse course catalog"
                            description="View public courses and course details."
                            state="always"
                        />
                        <PermissionRow
                            label="Enroll in courses"
                            description="Sign up for and begin taking published courses."
                            state={learnerCanEnroll ? 'on' : 'off'}
                        />
                        <PermissionRow
                            label="Track progress and earn certificates"
                            description="Mark lessons complete, take quizzes, and receive certificates."
                            state="always"
                        />
                        <PermissionRow
                            label="Admin panel access"
                            description="Access the admin dashboard, courses, users, or settings."
                            state="never"
                        />
                    </div>
                    <SwitchRow
                        label="Allow learners to enroll in courses"
                        description="When off, learners can browse the catalog but cannot enroll."
                        checked={learnerCanEnroll}
                        onChange={setLearnerCanEnroll}
                    />
                </div>

                <Separator />

                {/* ── Content Editor ── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40">
                            <Users className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Content Editor</h3>
                        <span className="text-xs text-muted-foreground">can manage courses in the admin panel</span>
                    </div>
                    <div className="divide-y rounded-lg border px-4">
                        <PermissionRow
                            label="Manage courses"
                            description="Create, edit, and publish courses, sections, and lessons."
                            state="always"
                        />
                        <PermissionRow
                            label="Manage users"
                            description="View and update user roles."
                            state={editorCanManageUsers ? 'on' : 'off'}
                        />
                        <PermissionRow
                            label="Platform settings"
                            description="Access and modify platform-wide settings."
                            state={editorCanAccessSettings ? 'on' : 'off'}
                        />
                    </div>
                    <div className="space-y-3">
                        <SwitchRow
                            label="Allow content editors to manage users"
                            description="Grants access to the Users page and role editing."
                            checked={editorCanManageUsers}
                            onChange={setEditorCanManageUsers}
                        />
                        <SwitchRow
                            label="Allow content editors to access settings"
                            description="Grants access to this Settings page."
                            checked={editorCanAccessSettings}
                            onChange={setEditorCanAccessSettings}
                        />
                    </div>
                </div>

                <Separator />

                {/* ── Super Admin ── */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                            <ShieldCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h3 className="text-sm font-semibold">Super Admin</h3>
                        <span className="text-xs text-muted-foreground">unrestricted access to everything</span>
                    </div>
                    <div className="divide-y rounded-lg border px-4 opacity-75">
                        <PermissionRow label="All learner permissions" state="always" />
                        <PermissionRow label="All content editor permissions" state="always" />
                        <PermissionRow label="Platform settings" state="always" />
                        <PermissionRow label="Role management" state="always" />
                    </div>
                    <p className="text-xs text-muted-foreground pl-1">
                        Super Admin permissions cannot be restricted.
                    </p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button onClick={save} disabled={processing}>Save Role Access</Button>
                </div>
            </CardContent>
        </Card>
    );
}
