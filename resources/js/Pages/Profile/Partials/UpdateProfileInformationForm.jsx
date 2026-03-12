import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Camera, X } from 'lucide-react';

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
    const user = usePage().props.auth.user;
    const avatarInput = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(user.avatar || null);

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        _method:      'patch',
        name:         user.name,
        email:        user.email,
        gender:       user.gender ?? '',
        race:         user.race ?? '',
        state:        user.state ?? '',
        birthdate:    user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '',
        occupation:   user.occupation ?? '',
        organization: user.organization ?? '',
        avatar_file:  null,
        avatar_clear: false,
    });

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

    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Update your personal details, learner profile, and profile picture.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Avatar */}
                <div>
                    <InputLabel value="Profile Picture" />
                    <div className="mt-2 flex items-center gap-4">
                        <div className="relative group">
                            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                                {previewUrl
                                    ? <img src={previewUrl} alt="Avatar" className="h-full w-full object-cover" />
                                    : <span>{initials}</span>
                                }
                            </div>
                            <button
                                type="button"
                                onClick={() => avatarInput.current?.click()}
                                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Camera className="h-5 w-5 text-white" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => avatarInput.current?.click()}
                                className="text-sm font-medium text-gray-700 hover:text-gray-900 underline underline-offset-2"
                            >
                                Change photo
                            </button>
                            {previewUrl && (
                                <button
                                    type="button"
                                    onClick={handleAvatarClear}
                                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                                >
                                    <X className="h-3 w-3" /> Remove photo
                                </button>
                            )}
                            <p className="text-xs text-gray-400">JPG, PNG or GIF · max 2 MB</p>
                        </div>

                        <input
                            ref={avatarInput}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>
                    <InputError className="mt-2" message={errors.avatar_file} />
                </div>

                {/* Name */}
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="gender" value="Gender" />
                        <select
                            id="gender"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <InputError className="mt-2" message={errors.gender} />
                    </div>

                    <div>
                        <InputLabel htmlFor="race" value="Race / Ethnicity" />
                        <select
                            id="race"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.race}
                            onChange={(e) => setData('race', e.target.value)}
                        >
                            <option value="">Select race</option>
                            {RACES.map((race) => (
                                <option key={race.value} value={race.value}>{race.label}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.race} />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="state" value="State" />
                        <select
                            id="state"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.state}
                            onChange={(e) => setData('state', e.target.value)}
                        >
                            <option value="">Select state</option>
                            {MALAYSIAN_STATES.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.state} />
                    </div>

                    <div>
                        <InputLabel htmlFor="birthdate" value="Date of Birth" />
                        <TextInput
                            id="birthdate"
                            type="date"
                            className="mt-1 block w-full"
                            value={data.birthdate}
                            onChange={(e) => setData('birthdate', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                        />
                        <InputError className="mt-2" message={errors.birthdate} />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="occupation" value="Occupation" />
                        <select
                            id="occupation"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={data.occupation}
                            onChange={(e) => setData('occupation', e.target.value)}
                        >
                            <option value="">Select occupation</option>
                            {OCCUPATIONS.map((occupation) => (
                                <option key={occupation.value} value={occupation.value}>{occupation.label}</option>
                            ))}
                        </select>
                        <InputError className="mt-2" message={errors.occupation} />
                    </div>

                    <div>
                        <InputLabel htmlFor="organization" value="Organization / Institution" />
                        <TextInput
                            id="organization"
                            className="mt-1 block w-full"
                            value={data.organization}
                            onChange={(e) => setData('organization', e.target.value)}
                            autoComplete="organization"
                        />
                        <InputError className="mt-2" message={errors.organization} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.{' '}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
