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
import SearchableSelect from '@/Components/SearchableSelect';
import { useT } from '@/lib/i18n';
import {
    ORGANIZATION_OTHER_VALUE,
    splitOrganizationValue,
    usesOrganizationList,
} from '@/lib/profileOrganizations';

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
    { value: 'student' },
    { value: 'government' },
    { value: 'private' },
    { value: 'self_employed' },
    { value: 'professional' },
    { value: 'academic' },
    { value: 'homemaker' },
    { value: 'retired' },
    { value: 'unemployed' },
    { value: 'other' },
];

const RACES = [
    { value: 'malay' },
    { value: 'chinese' },
    { value: 'indian' },
    { value: 'other_bumiputera' },
    { value: 'other' },
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
    const { platform, profileOptions } = usePage().props;
    const t = useT();
    const organizationOptions = profileOptions?.organizationOptions ?? [];
    const organizationSelectOccupations = profileOptions?.organizationSelectOccupations ?? ['student', 'academic'];
    const initialOrganizationState = splitOrganizationValue(
        user?.occupation ?? '',
        user?.organization ?? '',
        organizationOptions,
        organizationSelectOccupations,
    );

    const { data, setData, post, processing, errors } = useForm({
        name:         user?.name ?? '',
        gender:       user?.gender ?? '',
        race:         user?.race ?? '',
        state:        user?.state ?? '',
        birthdate:    user?.birthdate ?? '',
        occupation:   user?.occupation ?? '',
        occupation_other: user?.occupation_other ?? '',
        student_id:   user?.student_id ?? '',
        organization: initialOrganizationState.organization,
        organization_other: initialOrganizationState.organization_other,
    });

    const usesOrganizationDropdown = usesOrganizationList(data.occupation, organizationSelectOccupations);

    function handleOccupationChange(value) {
        const currentOrganizationValue = usesOrganizationDropdown
            ? (data.organization === ORGANIZATION_OTHER_VALUE ? data.organization_other : data.organization)
            : data.organization;

        const nextOrganizationState = splitOrganizationValue(
            value,
            currentOrganizationValue,
            organizationOptions,
            organizationSelectOccupations,
        );

        setData(prev => ({
            ...prev,
            occupation: value,
            occupation_other: value === 'other' ? prev.occupation_other : '',
            student_id: value === 'student' ? prev.student_id : '',
            organization: nextOrganizationState.organization,
            organization_other: nextOrganizationState.organization_other,
        }));
    }

    function submit(e) {
        e.preventDefault();
        post(route('profile.setup.store'));
    }

    const platformName = platform?.name || 'Free LMS';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
            <Head title={t('profile_setup.title')} />

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
                            <FormField label={t('profile.info.name')} required error={errors.name}>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder={t('profile.info.name')}
                                    autoFocus
                                />
                            </FormField>

                            {/* Gender */}
                            <FormField label={t('profile.info.gender')} required error={errors.gender}>
                                <div className="flex gap-3">
                                    {[
                                        { value: 'male', label: t('profile.info.male') },
                                        { value: 'female', label: t('profile.info.female') },
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
                                <FormField label={t('profile.info.race')} required error={errors.race}>
                                    <Select value={data.race} onValueChange={v => setData('race', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('profile.info.select_race')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RACES.map(r => (
                                                <SelectItem key={r.value} value={r.value}>
                                                    {t(`profile.info.race.${r.value}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>

                                <FormField label={t('profile.info.state')} required error={errors.state}>
                                    <Select value={data.state} onValueChange={v => setData('state', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('profile.info.select_state')} />
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
                                label={t('profile.info.birthdate')}
                                required
                                error={errors.birthdate}
                                hint={t('profile_setup.birthdate_hint')}
                            >
                                <Input
                                    type="date"
                                    value={data.birthdate}
                                    onChange={e => setData('birthdate', e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </FormField>

                            {/* Occupation */}
                            <FormField label={t('profile.info.occupation')} required error={errors.occupation}>
                                <Select value={data.occupation} onValueChange={handleOccupationChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('profile.info.select_occupation')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {OCCUPATIONS.map(o => (
                                            <SelectItem key={o.value} value={o.value}>
                                                {t(`profile.info.occupation.${o.value}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>

                            {data.occupation === 'other' && (
                                <FormField
                                    label={t('profile.info.occupation_other')}
                                    required
                                    error={errors.occupation_other}
                                >
                                    <Input
                                        value={data.occupation_other}
                                        onChange={e => setData('occupation_other', e.target.value)}
                                        placeholder={t('profile.info.occupation_other_placeholder')}
                                    />
                                </FormField>
                            )}

                            {data.occupation === 'student' && (
                                <FormField
                                    label={t('profile.info.student_id')}
                                    required
                                    error={errors.student_id}
                                >
                                    <Input
                                        value={data.student_id}
                                        onChange={e => setData('student_id', e.target.value)}
                                        placeholder={t('profile.info.student_id_placeholder')}
                                    />
                                </FormField>
                            )}

                            {/* Organization */}
                            <FormField
                                label={t('profile.info.organization')}
                                error={errors.organization || errors.organization_other}
                                hint={usesOrganizationDropdown
                                    ? t('profile_setup.organization_hint_select')
                                    : t('profile_setup.organization_hint_optional')}
                            >
                                {usesOrganizationDropdown ? (
                                    <div className="space-y-3">
                                        <SearchableSelect
                                            options={[
                                                ...organizationOptions,
                                                { value: ORGANIZATION_OTHER_VALUE, label: t('profile.info.organization_other') },
                                            ]}
                                            value={data.organization}
                                            onChange={v => setData('organization', v)}
                                            placeholder={t('profile.info.select_organization')}
                                            searchPlaceholder={t('profile_setup.organization_search')}
                                        />

                                        {data.organization === ORGANIZATION_OTHER_VALUE && (
                                            <Input
                                                value={data.organization_other}
                                                onChange={e => setData('organization_other', e.target.value)}
                                                placeholder={t('profile_setup.organization_other_placeholder')}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <Input
                                        value={data.organization}
                                        onChange={e => setData('organization', e.target.value)}
                                        placeholder={t('profile_setup.organization_example_placeholder')}
                                    />
                                )}
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
                        {t('profile_setup.update_later')}
                    </p>
                </div>
            </main>
        </div>
    );
}
