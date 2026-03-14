import { useState } from 'react';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import CaptchaField, { isCaptchaEnabled, resolveCaptchaToken } from '@/Components/CaptchaField';

export default function ForgotPassword({ status }) {
    const { props } = usePage();
    const captchaConfig = props?.integrations?.captcha ?? {};
    const [captchaClientError, setCaptchaClientError] = useState('');

    const { data, setData, post, transform, processing, errors } = useForm({
        email: '',
        captcha_token: '',
    });

    const submit = async (e) => {
        e.preventDefault();

        setCaptchaClientError('');

        const enabled = isCaptchaEnabled(captchaConfig, 'forgot_password');
        const token = await resolveCaptchaToken(captchaConfig, 'forgot_password', data.captcha_token);

        if (enabled && !token) {
            setCaptchaClientError('Captcha verification is required.');
            return;
        }

        transform((current) => ({ ...current, captcha_token: token || '' }))
            .post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-gray-600">
                Forgot your password? No problem. Just let us know your email
                address and we will email you a password reset link that will
                allow you to choose a new one.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => setData('email', e.target.value)}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="mt-3">
                    <CaptchaField
                        config={captchaConfig}
                        action="forgot_password"
                        token={data.captcha_token}
                        onTokenChange={(value) => setData('captcha_token', value)}
                        error={errors.captcha_token || captchaClientError}
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <PrimaryButton className="ms-4" disabled={processing}>
                        Email Password Reset Link
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
