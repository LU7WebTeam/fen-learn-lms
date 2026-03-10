import { useRef, useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Camera, X } from 'lucide-react';

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
                    Update your name, email, and profile picture.
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
