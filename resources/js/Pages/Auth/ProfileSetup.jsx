import { useForm, usePage } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { GraduationCap, User, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { useT } from '@/lib/i18n';

const MALAYSIAN_STATES = [
    'Johor',
    'Kedah',
    'Kelantan',
    'Melaka',
    'Negeri Sembilan',
    'Pahang',
    'Perak',
    'Perlis',
    'Pulau Pinang',
    'Sabah',
    'Sarawak',
    'Selangor',
    'Terengganu',
    'Wilayah Persekutuan Kuala Lumpur',
    'Wilayah Persekutuan Labuan',
    'Wilayah Persekutuan Putrajaya',
];

const OCCUPATIONS = [
    { value: 'student',            label: 'Student' },
    { value: 'government',         label: 'Government Employee' },
    { value: 'private',            label: 'Private Sector Employee' },
    { value: 'self_employed',      label: 'Self-employed / Entrepreneur' },
    { value: 'professional',       label: 'Professional (Doctor, Lawyer, etc.)' },
    { value: 'academic',           label: 'Academic / Educator' },
    { value: 'homemaker',          label: 'Homemaker' },
    { value: 'retired',            label: 'Retired' },
    { value: 'unemployed',         label: 'Unemployed' },
    { value: 'other',              label: 'Other' },
];

const RACES = [
    { value: 'malay',            label: 'Malay' },
    { value: 'chinese',          label: 'Chinese' },
    { value: 'indian',           label: 'Indian' },
    { value: 'other_bumiputera', label: 'Other Bumiputera' },
    { value: 'other',            label: 'Other' },
];

function FieldError({ message }) {
    if (!message) return null;
    return (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {message}
        </p>
    );
}

function FormField({ label, required, error, children, hint }) {
    return (
        <div className="space-y-1.5">
            <Label>
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </Label>
            {children}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            <FieldError message={error} />
        </div>
    );
}

export default function ProfileSetup({ user }) {
    const { platform } = usePage().props;
    const t = useT();

    const { data, setData, post, processing, errors } = useForm({
        name:         user?.name ?? '',
        gender:       user?.gender ?? '',
        race:         user?.race ?? '',
        state:        user?.state ?? '',
        birthdate:    user?.birthdate ?? '',
        occupation:   user?.occupation ?? '',
        organization: user?.organization ?? '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('profile.setup.store'));
    }

    const platformName = platform?.name || 'Free LMS';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
            <Head title="Complete Your Profile" />

            {/* Top bar */}
            <header className="border-b bg-background/80 backdrop-blur px-6 py-3 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm">{platformName}</span>
            </header>

            <main className="flex-1 flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('profile_setup.title')}</h1>
                        <p className="mt-1.5 text-sm text-muted-foreground">
                            {t('profile_setup.subtitle')}
                        </p>
                    </div>

                    {/* Steps indicator */}
                    <div className="mb-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">✓</span>
                            {t('profile_setup.step_account_created')}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                            {t('profile_setup.step_profile_info')}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">3</span>
                            {t('profile_setup.step_start_learning')}
                        </span>
                    </div>

                    {/* Form card */}
                    <div className="rounded-xl border bg-card shadow-sm p-6 sm:p-8">
                        <form onSubmit={submit} className="space-y-6">

                            {/* Full name */}
                            <FormField label="Full Name" required error={errors.name}>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Your full name"
                                    autoFocus
                                />
                            </FormField>

                            {/* Gender */}
                            <FormField label="Gender" required error={errors.gender}>
                                <div className="flex gap-3">
                                    {[
                                        { value: 'male',   label: 'Male' },
                                        { value: 'female', label: 'Female' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setData('gender', opt.value)}
                                            className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                                                data.gender === opt.value
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </FormField>

                            {/* Race + State side by side */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField label="Race / Ethnicity" required error={errors.race}>
                                    <Select value={data.race} onValueChange={v => setData('race', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select race" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RACES.map(r => (
                                                <SelectItem key={r.value} value={r.value}>
                                                    {r.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <FormField label="State" required error={errors.state}>
                                    <Select value={data.state} onValueChange={v => setData('state', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MALAYSIAN_STATES.map(s => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            </div>

                            {/* Birthdate */}
                            <FormField
                                label="Date of Birth"
                                required
                                error={errors.birthdate}
                                hint="Used to calculate your age group for analytics. Not publicly visible."
                            >
                                <Input
                                    type="date"
                                    value={data.birthdate}
                                    onChange={e => setData('birthdate', e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </FormField>

                            {/* Occupation */}
                            <FormField label="Occupation" required error={errors.occupation}>
                                <Select value={data.occupation} onValueChange={v => setData('occupation', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select occupation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OCCUPATIONS.map(o => (
                                            <SelectItem key={o.value} value={o.value}>
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            {/* Organization */}
                            <FormField
                                label="Organization / Institution"
                                error={errors.organization}
                                hint="Optional — your school, company, or institution name."
                            >
                                <Input
                                    value={data.organization}
                                    onChange={e => setData('organization', e.target.value)}
                                    placeholder="e.g. Universiti Malaya, Petronas, etc."
                                />
                            </FormField>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={processing}
                                >
                                    {processing ? t('profile_setup.submitting') : t('profile_setup.submit')}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        You can update these details later from your profile settings.
                    </p>
                </div>
            </main>
        </div>
    );
}
