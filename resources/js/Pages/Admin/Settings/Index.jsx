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
    Award,
    Wrench,
    Upload,
    X,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
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

export default function SettingsIndex({ settings }) {
    const { flash } = usePage().props;
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
                        <TabsTrigger value="maintenance" className="gap-1.5">
                            <Wrench className="h-3.5 w-3.5" />Maintenance
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

                    {/* ── MAINTENANCE ── */}
                    <TabsContent value="maintenance">
                        <MaintenanceTab settings={settings} onSave={submitGroup} processing={processing} />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
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
    const [username, setUsername] = useState(settings.mail_username || '');
    const [password, setPassword] = useState('');
    const [senderName, setSenderName] = useState(settings.mail_sender_name || '');
    const [senderAddress, setSenderAddress] = useState(settings.mail_sender_address || '');
    const [showPassword, setShowPassword] = useState(false);

    function save() {
        onSave('email', {
            mail_driver:         driver,
            mail_host:           host,
            mail_port:           port,
            mail_username:       username,
            mail_password:       password,
            mail_sender_name:    senderName,
            mail_sender_address: senderAddress,
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email / SMTP
                </CardTitle>
                <CardDescription>
                    Configure outbound email so the platform can send verification and password-reset messages.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
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
                        <div className="grid grid-cols-3 gap-4">
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
                        </div>
                    </>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
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
