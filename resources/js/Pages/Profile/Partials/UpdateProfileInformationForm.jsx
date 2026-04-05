import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import SearchableSelect from '@/Components/SearchableSelect';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Camera, X } from 'lucide-react';
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
    { value: 'student', label: 'Student' },
    { value: 'government', label: 'Government Employee' },
    { value: 'private', label: 'Private Sector Employee' },
    { value: 'self_employed', label: 'Self-employed / Entrepreneur' },
    { value: 'professional', label: 'Professional (Doctor, Lawyer, etc.)' },
    { value: 'academic', label: 'Academic / Educator' },
    { value: 'homemaker', label: 'Homemaker' },
    { value: 'retired', label: 'Retired' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'other', label: 'Other' },
];

const RACES = [
    { value: 'malay', label: 'Malay' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'indian', label: 'Indian' },
    { value: 'other_bumiputera', label: 'Other Bumiputera' },
    { value: 'other', label: 'Other' },
];

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const page = usePage().props;
    const user = page.auth.user;
    const organizationOptions = page.profileOptions?.organizationOptions ?? [];
    const organizationSelectOccupations = page.profileOptions?.organizationSelectOccupations ?? ['student', 'academic'];
    const avatarInput = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(user.avatar || null);
    const t = useT();
    const initialOrganizationState = splitOrganizationValue(
        user.occupation ?? '',
        user.organization ?? '',
        organizationOptions,
        organizationSelectOccupations,
    );

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        _method:      'patch',
        name:         user.name,
        gender:       user.gender ?? '',
        race:         user.race ?? '',
        state:        user.state ?? '',
        birthdate:    user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '',
        occupation:   user.occupation ?? '',
        occupation_other: user.occupation_other ?? '',
        student_id:   user.student_id ?? '',
        organization: initialOrganizationState.organization,
        organization_other: initialOrganizationState.organization_other,
    });

    const usesOrganizationDropdown = usesOrganizationList(data.occupation, organizationSelectOccupations);
    const fieldSurfaceClass = 'rounded-md border border-slate-300 bg-slate-50 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';
    const dropdownFieldClass = `mt-1 block w-full ${fieldSurfaceClass}`;
    const textFieldClass = `mt-1 block w-full ${fieldSurfaceClass}`;

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

    function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setData(prev => ({ ...prev, avatar_file: file, avatar_clear: false }));
        setPreviewUrl(URL.createObjectURL(file));
    }

    function handleAvatarClear() {
        setData(prev => ({ ...prev, avatar_file: null, avatar_clear: true }));
        setPreviewUrl(null);
        if (avatarInput.current) avatarInput.current.value = '';
    }

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), { forceFormData: true });
    };


    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('profile.info.title')}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('profile.info.subtitle')}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">

                {/* Full Name (read-only) */}
                <div>
                    <InputLabel htmlFor="name" value={t('profile.info.full_name') || 'Full Name'} />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full bg-gray-100 dark:bg-slate-800 dark:text-slate-200 cursor-not-allowed"
                        value={data.name}
                        readOnly
                        disabled
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value={t('profile.info.email')} />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={user.email}
                        disabled
                        readOnly
                        autoComplete="username"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('profile.info.email_locked')}</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="gender" value={t('profile.info.gender')} />
                        <select
                            id="gender"
                            className={dropdownFieldClass}
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                        >
                            <option value="">{t('profile.info.select_gender')}</option>
                            <option value="male">{t('profile.info.male')}</option>
                            <option value="female">{t('profile.info.female')}</option>
                        </select>
                        <InputError className="mt-2" message={errors.gender} />
                    </div>

                    <div>
                        <InputLabel htmlFor="race" value={t('profile.info.race')} />
                        <select
                            id="race"
                            className={dropdownFieldClass}
                            value={data.race}
                            onChange={(e) => setData('race', e.target.value)}
                        >
                            <option value="">{t('profile.info.select_race')}</option>
                            {RACES.map((race) => (
                                <option key={race.value} value={race.value}>{t('profile.info.race.' + race.value)}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.race} />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="state" value={t('profile.info.state')} />
                        <select
                            id="state"
                            className={dropdownFieldClass}
                            value={data.state}
                            onChange={(e) => setData('state', e.target.value)}
                        >
                            <option value="">{t('profile.info.select_state')}</option>
                            {MALAYSIAN_STATES.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.state} />
                    </div>

                    <div>
                        <InputLabel htmlFor="birthdate" value={t('profile.info.birthdate')} />
                        <TextInput
                            id="birthdate"
                            type="date"
                            className={textFieldClass}
                            value={data.birthdate}
                            onChange={(e) => setData('birthdate', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                        <InputError className="mt-2" message={errors.birthdate} />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="occupation" value={t('profile.info.occupation')} />
                        <select
                            id="occupation"
                            className={dropdownFieldClass}
                            value={data.occupation}
                            onChange={(e) => handleOccupationChange(e.target.value)}
                        >
                            <option value="">{t('profile.info.select_occupation')}</option>
                            {OCCUPATIONS.map((occupation) => (
                                <option key={occupation.value} value={occupation.value}>{t('profile.info.occupation.' + occupation.value)}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.occupation} />
                    </div>

                    <div>
                        {data.occupation === 'other' && (
                            <>
                                <InputLabel htmlFor="occupation_other" value={t('profile.info.occupation_other')} />
                                <TextInput
                                    id="occupation_other"
                                    className={textFieldClass}
                                    value={data.occupation_other}
                                    onChange={(e) => setData('occupation_other', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.occupation_other} />
                            </>
                        )}

                        {data.occupation === 'student' && (
                            <>
                                <InputLabel htmlFor="student_id" value={t('profile.info.student_id')} />
                                <TextInput
                                    id="student_id"
                                    className={textFieldClass}
                                    value={data.student_id}
                                    onChange={(e) => setData('student_id', e.target.value)}
                                />
                                <InputError className="mt-2" message={errors.student_id} />
                            </>
                        )}
                    </div>

                    <div>
                        <InputLabel htmlFor="organization" value={t('profile.info.organization')} />
                        {usesOrganizationDropdown ? (
                            <div className="mt-1 space-y-3">
                                <SearchableSelect
                                    options={[
                                        ...organizationOptions,
                                        { value: ORGANIZATION_OTHER_VALUE, label: t('profile.info.organization_other') },
                                    ]}
                                    value={data.organization}
                                    onChange={(nextValue) => setData('organization', nextValue)}
                                    placeholder={t('profile.info.select_organization')}
                                    searchPlaceholder={t('profile.info.select_organization')}
                                    className="mt-0 border-slate-300 bg-slate-50 text-gray-900 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                />

                                {data.organization === ORGANIZATION_OTHER_VALUE && (
                                    <TextInput
                                        id="organization_other"
                                        className={`${fieldSurfaceClass} block w-full`}
                                        value={data.organization_other}
                                        onChange={(e) => setData('organization_other', e.target.value)}
                                        autoComplete="organization"
                                    />
                                )}
                            </div>
                        ) : (
                            <TextInput
                                id="organization"
                                className={textFieldClass}
                                value={data.organization}
                                onChange={(e) => setData('organization', e.target.value)}
                                autoComplete="organization"
                            />
                        )}
                        <InputError className="mt-2" message={errors.organization || errors.organization_other} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            {t('profile.info.unverified')}{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 dark:text-gray-300 underline hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                {t('profile.info.resend')}
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                {t('profile.info.verification_sent')}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>{t('profile.info.save')}</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('profile.info.saved')}</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
