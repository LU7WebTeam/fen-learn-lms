import { Head, Link, usePage } from '@inertiajs/react';
import LangSwitcher from '@/Components/LangSwitcher';
import AnalyticsTracker from '@/Components/AnalyticsTracker';
import { useT } from '@/lib/i18n';
import { useEffect, useState } from 'react';

function Section({ title, children }) {
    return (
        <section className="space-y-3 border-t border-[#d9dee8] pt-6 first:border-t-0 first:pt-0">
            <h2 className="text-2xl leading-tight text-[#131722] sm:text-3xl">{title}</h2>
            <div className="space-y-3 text-base leading-relaxed text-[#545c6b]">{children}</div>
        </section>
    );
}

function Clause({ label, children }) {
    return (
        <div className="flex gap-3">
            <span className="shrink-0 font-semibold text-[#131722]">{label}</span>
            <div className="flex-1 space-y-2">{children}</div>
        </div>
    );
}

export default function Terms() {
    const { platform, auth } = usePage().props;
    const name = platform?.name || 'FEN Learn';
    const platformDarkLogoUrl = platform?.logo_dark_url || platform?.logo_url || null;
    const website = 'fen-learn.fenetwork.my';
    const country = 'Malaysia';
    const updatedOn = '9 June 2026';
    const t = useT();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showAuthMenu, setShowAuthMenu] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setIsScrolled(window.scrollY > 24);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title={t('terms.title', { name })} />
            <AnalyticsTracker />

            <div className="min-h-screen bg-[#eceff3] text-[#0f1115]">
                <header className="sticky top-0 z-50 px-5 pt-4 2xl:px-8">
                    <div className={`w-full rounded-2xl px-4 py-4 text-white shadow-[0_18px_45px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors duration-300 sm:px-7 ${isScrolled ? 'bg-black/60' : 'bg-black/30'}`}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-6">
                                <Link href={route('home')} className="inline-flex items-center">
                                    {platformDarkLogoUrl ? (
                                        <img src={platformDarkLogoUrl} alt={name} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                                    ) : (
                                        <span className="text-3xl font-black tracking-tight">{name}</span>
                                    )}
                                </Link>
                                <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
                                    <Link href={route('terms')} className="opacity-95 transition hover:opacity-100">{t('nav.terms')}</Link>
                                    <Link href={route('privacy')} className="opacity-80 transition hover:opacity-100">{t('nav.privacy')}</Link>
                                </nav>
                            </div>

                            <div className="flex items-center gap-3 text-sm font-semibold">
                                <a href="https://www.fenetwork.my" target="_blank" rel="noopener noreferrer" className="hidden sm:block">
                                    <img src="/images/fen-logo-.png" alt="FEN Network" className="h-10 w-auto" />
                                </a>
                                <div className="block">
                                    <LangSwitcher className="border-white bg-white text-[#131722]" />
                                </div>
                                {auth?.user ? (
                                    <Link href={route('dashboard')} className="inline-flex min-w-[118px] items-center justify-center rounded-full bg-[#b53391] px-3.5 py-1.5 text-[0.92rem] font-semibold text-white transition hover:bg-[#9f2c80] sm:min-w-[160px] sm:px-5 sm:py-2.5 sm:text-[1rem]">
                                        {t('landing.cta.my_dashboard')}
                                    </Link>
                                ) : (
                                    <>
                                        <div className="relative sm:hidden">
                                            {showAuthMenu && (
                                                <div className="fixed inset-0 z-40" onClick={() => setShowAuthMenu(false)} />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setShowAuthMenu(v => !v)}
                                                className="inline-flex items-center gap-1 rounded-full bg-[#b53391] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#9f2c80]"
                                            >
                                                {t('landing.cta.register')} ▾
                                            </button>
                                            {showAuthMenu && (
                                                <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                                                    <Link
                                                        href={route('login')}
                                                        className="block px-4 py-2.5 text-sm text-[#131722] transition hover:bg-slate-50"
                                                    >
                                                        {t('landing.cta.login')}
                                                    </Link>
                                                    <div className="border-t border-slate-100" />
                                                    <Link
                                                        href={route('register')}
                                                        className="block px-4 py-2.5 text-sm font-semibold text-[#b53391] transition hover:bg-slate-50"
                                                    >
                                                        {t('landing.cta.register')}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                        <Link href={route('login')} className="hidden opacity-90 transition hover:opacity-100 sm:inline-flex">
                                            {t('landing.cta.login')}
                                        </Link>
                                        <Link href={route('register')} className="hidden items-center justify-center rounded-full bg-[#b53391] font-semibold text-white transition hover:bg-[#9f2c80] sm:inline-flex sm:min-w-[160px] sm:px-5 sm:py-2.5 sm:text-[1rem]">
                                            {t('landing.cta.register')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="-mt-[84px] w-full px-5 pt-4 2xl:px-8">
                    <div
                        className="relative min-h-[50vh] overflow-hidden rounded-2xl bg-cover bg-center"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 18% 24%, rgba(252,184,47,0.22) 0 10%, transparent 11%), radial-gradient(circle at 78% 30%, rgba(181,51,145,0.2) 0 12%, transparent 13%), linear-gradient(135deg, #1f1437 0%, #2a1548 38%, #5a267c 100%)',
                        }}
                    >
                        <div className="relative z-10 flex min-h-[50vh] w-full items-end px-6 pb-8 pt-[100px] sm:px-8 sm:pb-12 lg:px-10">
                            <div className="max-w-full sm:max-w-[70%]">
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">{t('nav.terms')}</p>
                                <h1 className="mt-3 text-4xl leading-[0.95] text-white sm:text-6xl">{t('terms.heading')}</h1>
                                <p className="mt-4 text-base text-white/85 sm:text-lg">{t('terms.last_updated', { updatedOn })}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <main className="mx-auto w-full max-w-[1440px] p-0">
                    <section className="mt-4 rounded-xl bg-[#ebedf1] p-4 sm:p-5">
                        <article className="rounded-xl bg-white p-6 shadow-[0_18px_45px_-34px_rgba(15,17,21,0.35)] sm:p-8 lg:p-10">
                            <div className="mb-8 space-y-4">
                                <h2 className="text-4xl leading-[0.95] text-[#131722] sm:text-5xl">{t('terms.heading')}</h2>
                                <p className="text-base leading-relaxed text-[#545c6b]">{t('terms.last_updated', { updatedOn })}</p>
                                <div className="rounded-xl bg-[#f4f6fa] p-4 text-sm leading-relaxed text-[#545c6b]">
                                    <p><span className="font-semibold text-[#131722]">Website:</span> {website}</p>
                                    <p className="mt-2"><span className="font-semibold text-[#131722]">Jurisdiction:</span> {country}</p>
                                </div>
                            </div>

                            <div className="space-y-6">

                                <Section title="TERMS OF USE FOR FEN LEARNING PLATFORM">
                                    <p className="font-semibold text-[#131722]">General.</p>
                                    <p>
                                        These Terms of Use (hereinafter also referred to as &ldquo;this Agreement&rdquo;) sets forth the terms and conditions
                                        that apply to the Users of FEN Learning. By using FEN Learning (other than to read this Agreement for the first time),
                                        the Users agree to comply with all of the terms and conditions hereof. The right to use FEN Learning is personal to
                                        the Users and is not transferable or assignable to any other person, whether an individual or entity. The Users are
                                        responsible for all use of FEN Learning under their Accounts.
                                    </p>
                                    <p>
                                        BNM shall have the right at any time to change or discontinue any aspect or feature of FEN Learning, including, but
                                        not limited to, content, hours of availability, and equipment needed for access or use of FEN Learning.
                                    </p>
                                </Section>

                                <Section title="2. Definitions.">
                                    <Clause label="(a)">
                                        <p>
                                            &ldquo;FEN Learning&rdquo; is a financial education learning platform operated and maintained by Bank Negara
                                            Malaysia (&ldquo;BNM&rdquo;) which consists of financial education videos including text, music and interactive
                                            features provided by Financial Education Network (FEN) members, partners and other third parties.
                                        </p>
                                    </Clause>
                                    <Clause label="(b)">
                                        <p>
                                            &ldquo;Users&rdquo; means individual persons who access or use FEN Learning, and/or create an
                                            &ldquo;Account&rdquo; for access to or use of FEN Learning, whichever is applicable.
                                        </p>
                                    </Clause>
                                    <p>
                                        The headings used in this Agreement are inserted merely for convenience of reference and shall not have any effect
                                        on the interpretation and construction of any of the provisions contained herein. Words importing the singular shall
                                        include the plural and vice versa and words importing one gender shall include the other gender.
                                    </p>
                                </Section>

                                <Section title="3. Modification.">
                                    <p>
                                        BNM shall have the sole right at any time to delete, change or modify the terms and conditions of this Agreement or
                                        any part thereof. Such changes or modifications shall be effective immediately and any use of FEN Learning by the
                                        Users after such changes or modifications shall be deemed to constitute acceptance of the Users of such changes or
                                        modifications of the Terms of Use.
                                    </p>
                                </Section>

                                <Section title="4. Equipment.">
                                    <p>
                                        The Users shall be responsible for obtaining and maintaining all end-users devices (hereinafter referred to as
                                        &ldquo;Equipment&rdquo;) and all licences, permits, consents, approvals or other rights as may be required to
                                        access to and use FEN Learning and their Accounts and all charges related thereto.
                                    </p>
                                </Section>

                                <Section title="5. Users Conduct.">
                                    <p>
                                        The Users shall use FEN Learning for lawful purposes only. The Users shall be solely responsible for the set-up or
                                        configuration of their Equipment to access and use FEN Learning and their Accounts. The Users shall not post, publish,
                                        upload, distribute, reproduce, modify or transmit through FEN Learning any material which violates or infringes in
                                        any way upon the rights of others, which is unlawful, threatening, abusive, defamatory, an invasion of privacy,
                                        vulgar, obscene, profane, or otherwise objectionable, or which encourages conduct that would constitute a criminal
                                        offence, give rise to civil liability or otherwise violate any law. BNM reserves the right to remove or disable
                                        access to any such material at its discretion.
                                    </p>
                                    <Clause label="(b)">
                                        <p>
                                            The Users are solely responsible for keeping their passwords and other account identifiers safe, secured and
                                            protected. The Users shall not transfer or disclose their FEN Learning passwords and Accounts to any unauthorized
                                            person. The Users are entirely responsible for all activities that occur through use of such passwords or Accounts
                                            and the Users must notify BNM as soon as practicable of any unauthorised use of their passwords or Accounts.
                                            This notification can be made to{' '}
                                            <a href="mailto:learn@fenetwork.my" className="text-[#b53391] underline hover:text-[#9f2c80]">
                                                learn@fenetwork.my
                                            </a>.
                                        </p>
                                    </Clause>
                                </Section>

                                <Section title="6. Intellectual Property and Proprietary Rights.">
                                    <p>
                                        FEN Learning contains material subject to the protection of copyright, trademarks, patents and other proprietary
                                        information, including, but not limited to text, software, photos, videos, graphics, music and sound, and the entire
                                        contents of FEN Learning are subject to copyright as a collective work under the Malaysian copyright, trademarks and
                                        patent laws. BNM owns a copyright in the selection, coordination, arrangement and enhancement of FEN Learning
                                        content, as well as in the content original to BNM. Users may not modify, publish, transmit, participate in the
                                        transfer or sale, create derivative works, or in any way exploit, any of the content, in whole or in part. Users may
                                        download copyrighted material for Users&rsquo; personal use only. Except as otherwise expressly permitted under
                                        copyright law, no copying, redistribution, retransmission, publication or commercial exploitation of downloaded
                                        material will be permitted without the express prior written permission of BNM and the copyright owner.
                                    </p>
                                    <p>
                                        The foregoing provisions of this Section 6 are for the benefit of BNM, other FEN Members, FEN Partners and third
                                        party content providers and licensors and each shall have the right to assert and enforce such provisions directly
                                        or on its own behalf.
                                    </p>
                                </Section>

                                <Section title="7. Monitoring.">
                                    <p>
                                        BNM shall have the right, but not the obligation, to monitor the content of FEN Learning, to manage and control the
                                        access and use of the Users to FEN Learning and all information stored therein, to determine compliance with this
                                        Agreement and any operating rules established by BNM and to satisfy any law, regulation or rule and policy of the
                                        Malaysian government. BNM shall have the right in its sole discretion to edit, refuse to post or remove any material
                                        submitted to or posted on FEN Learning.
                                    </p>
                                </Section>

                                <Section title="8. Liability and Indemnification.">
                                    <Clause label="(a)">
                                        <p>
                                            Without prejudice to any other remedy available to BNM under this Agreement or the law, the Users shall be
                                            liable to BNM for any direct or foreseeable loss or damage howsoever caused arising in connection with this
                                            Agreement.
                                        </p>
                                    </Clause>
                                    <Clause label="(b)">
                                        <p>
                                            The Users agree to defend, indemnify and hold harmless BNM, its affiliates and their respective directors,
                                            officers, employees and agents from and against all loss, damage, claims or expenses, including attorneys&rsquo;
                                            fees, arising out of the use of FEN Learning by the Users.
                                        </p>
                                    </Clause>
                                </Section>

                                <Section title="9. Third Party Content.">
                                    <p>
                                        Any opinions, advice, statements, services, offers, or other information or content expressed or made available by
                                        third parties, including information providers, are those of the respective author(s) or distributor(s) and not of
                                        BNM. Neither BNM nor any third-party provider of information guarantees the accuracy, completeness, or usefulness of
                                        any content, nor its merchantability or fitness for any particular purpose. (Refer to Section 13 below for the
                                        complete provisions governing disclaimers of liability.)
                                    </p>
                                    <p>
                                        The content available through FEN Learning represents the opinions and judgments of the respective information
                                        providers. BNM neither endorses nor is responsible for the accuracy or reliability of any opinion, advice or
                                        statement made on FEN Learning by anyone other than authorized BNM employee spokespersons while acting in their
                                        official capacities. Under no circumstances will BNM be liable for any loss or damage caused by Users&rsquo;
                                        reliance on information obtained through FEN Learning.
                                    </p>
                                </Section>

                                <Section title="10. Termination.">
                                    <Clause label="(a)">
                                        <p>
                                            Either BNM or the Users may terminate this Agreement at any time. Without limiting the foregoing, BNM shall
                                            have the right to terminate immediately, the Users&rsquo; Accounts without prior notice to the Users in the
                                            event of any conduct by the Users which BNM, in its sole discretion, considers as a breach of this Agreement,
                                            if the Users have provided any false or incomplete information on FEN Learning, if in the opinion of BNM, it
                                            is not in the public interest for any reason whatsoever for the User to continue to have access to FEN Learning.
                                        </p>
                                    </Clause>
                                    <Clause label="(b)">
                                        <p>
                                            The provisions on sections 5(b), 6, 8, 9 and 13 shall survive termination of this Agreement.
                                        </p>
                                    </Clause>
                                </Section>

                                <Section title="11. Name and Emblem of BNM.">
                                    <p>
                                        The emblem of Bank Negara Malaysia, or the name of Bank Negara Malaysia, including any abbreviation of its name,
                                        is protected by the Emblems and Names (Prevention of Improper Use) Act 1963. Therefore, the emblem and name of BNM
                                        shall not be used by the Users or any other person unless in accordance with law. All other trademarks appearing on
                                        FEN Learning are the property of their respective owners.
                                    </p>
                                </Section>

                                <Section title="12. Link Policy.">
                                    <p>
                                        The Users are advised to note that all links from FEN Learning are provided for the Users&rsquo; convenience only.
                                        Through FEN Learning, the Users are able to link to other websites which are not under the control of BNM. Please
                                        be advised that BNM has no control over the nature, content and availability of those sites. The inclusion of any
                                        links does not necessarily imply a recommendation or endorsement from BNM on the views expressed within the websites.
                                        BNM reserves the right at all times to withdraw the link to any website.
                                    </p>
                                </Section>

                                <Section title="13. Disclaimer Of Liability.">
                                    <Clause label="(a)">
                                        <p>
                                            The Users expressly agree that use of FEN Learning is at the Users&rsquo; sole risk. BNM, its affiliates or
                                            their respective directors, employees, agents, third party content providers do not warrant that FEN Learning
                                            will be uninterrupted or error free, nor do they make any warranty as to the results that may be obtained from
                                            use of FEN Learning, or as to the accuracy, reliability or content of any information or services provided
                                            through FEN Learning. The calculators and tools available on FEN Learning are provided for informational
                                            purposes only and shall not be treated as financial, legal or professional advice.
                                        </p>
                                    </Clause>
                                    <Clause label="(b)">
                                        <p>
                                            FEN Learning is provided on an &ldquo;as is&rdquo; basis without warranties of any kind, either express or
                                            implied, including but not limited to, warranties or title or implied warranties of merchantability, fitness
                                            for a particular purpose, accuracy, timeliness or completeness, other than those warranties which are implied
                                            by and incapable of exclusion, restriction or modification under the laws applicable to this Agreement.
                                        </p>
                                    </Clause>
                                    <p>
                                        This disclaimer of liability applies to any damage or injury caused by any failure of performance, error, omission,
                                        interruption, deletion, defect, delay in operation or transmission, computer virus, communication line failure,
                                        theft or destruction or unauthorized access to alteration of, or use of record, whether for breach of contract,
                                        negligence or other tortious behaviour or under any other cause of action. The Users specifically acknowledge that
                                        BNM is not liable for the defamatory, offensive or illegal conduct of other Users or third parties and that the
                                        risk of injury from the foregoing rests entirely with the Users.
                                    </p>
                                    <p>
                                        In no event will BNM, or any person or entity involved in creating, producing or distributing FEN Learning or
                                        the FEN Learning software, be liable for any damage, including without limitation, direct, indirect, incidental,
                                        special, consequential or punitive damages arising out of the use or inability to use FEN Learning. The Users
                                        hereby acknowledge that the provisions of this paragraph shall apply to all content on FEN Learning.
                                    </p>
                                    <p>
                                        In addition to the terms set forth above, neither BNM nor its affiliates, information providers or content partners
                                        shall be liable regardless of the cause or duration, for any errors, inaccuracies, omissions, or other defects in,
                                        or untimeliness or inauthenticity of, the information contained within FEN Learning, or for any delay or
                                        interruption in the transmission thereof to the Users, or for any claims or losses arising therefrom or occasioned
                                        thereby. None of the foregoing parties shall be liable for any third-party claims or losses of any nature,
                                        including but not limited to, loss of profits, punitive or consequential damages.
                                    </p>
                                    <p>
                                        Reference to any specific commercial product, process or service by trade name, trade mark, manufacture or otherwise
                                        by BNM and other FEN Members, FEN Partners or third-party content providers or information providers does not
                                        constitute an endorsement, a recommendation or a favouring by BNM.
                                    </p>
                                </Section>

                                <Section title="14. Miscellaneous.">
                                    <p>
                                        This Agreement and any operating rules for FEN Learning established by BNM constitute the entire agreement of the
                                        parties with respect to the subject matter hereof, and supersede all previous written or oral agreements between
                                        the parties with respect to such subject matter. This Agreement shall be construed in accordance with the laws of
                                        Malaysia. Parties shall attempt to settle, amicably and by mutual agreement, any dispute arising under this
                                        Agreement within thirty (30) days, failing which either party may seek recourse to appropriate dispute resolution
                                        mechanisms under Malaysian law.
                                    </p>
                                </Section>

                                <Section title="15. Force Majeure.">
                                    <p>
                                        BNM shall not have any liability whatsoever or be deemed to be in default for any delay or failure in performance
                                        under this Agreement resulting from acts beyond the control of BNM, including without limitation to acts of God,
                                        acts or regulations or measures of any governmental or supranational authority, war or national emergency, accident,
                                        fire, flood, lightning, electrical failure, riot, strike, lock outs, industrial disputes, pandemic or epidemic.
                                    </p>
                                </Section>

                                <Section title="16. Privacy Statement.">
                                    <p>
                                        BNM&rsquo;s privacy statement made available at{' '}
                                        <a
                                            href="https://www.bnm.gov.my/privacy-statement"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#b53391] underline hover:text-[#9f2c80]"
                                        >
                                            https://www.bnm.gov.my/privacy-statement
                                        </a>{' '}
                                        forms part of this Agreement and shall be complied with by the Users and BNM.
                                    </p>
                                </Section>

                                <Section title="17. Monitoring System.">
                                    <p>
                                        For security purposes and to ensure that FEN Learning remains available to Users, BNM uses special software
                                        programs for monitoring network traffic to identify unauthorised attempts to upload or change information, or
                                        otherwise to cause damage to the server system. These programs collect no information that directly identify
                                        individuals, but they do collect information that could help BNM identify someone attempting to tamper with
                                        FEN Learning. The Users should take note that all access and use of FEN Learning is subject to monitoring in
                                        accordance with applicable law.
                                    </p>
                                </Section>

                                <Section title="18. Log Information.">
                                    <p>
                                        The servers automatically record information that the Users&rsquo; browsers send whenever visiting FEN Learning.
                                        These server logs may include information such as the date and time of visit, Internet Protocol address, browser
                                        type, browser language, browser screen size, and one or more cookies that identify the browser. The information
                                        BNM collects is only used to compile statistics, on an aggregated basis, on the usage of FEN Learning.
                                    </p>
                                </Section>

                            </div>
                        </article>
                    </section>
                </main>

                <footer className="mt-4 w-full px-5 pb-4 sm:pb-6 2xl:px-8">
                    <div className="w-full rounded-2xl bg-[#17191f] px-6 py-7 text-[#d4d8e2] sm:px-8">
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="flex flex-col items-center gap-1 text-center text-sm sm:flex-row sm:gap-3 sm:text-left">
                                <Link href={route('home')} className="inline-flex items-center">
                                    {platformDarkLogoUrl ? (
                                        <img src={platformDarkLogoUrl} alt={name} className="h-[24px] w-auto object-contain sm:h-[30px]" />
                                    ) : (
                                        <span className="text-lg font-bold text-white">{name.charAt(0)}</span>
                                    )}
                                </Link>
                                {!platformDarkLogoUrl && <span className="hidden text-[#4a5060] sm:inline">|</span>}
                                <span className="text-[#b8bdc8]">&copy; {new Date().getFullYear()} {name}. {t('common.all_rights_reserved')}</span>
                            </div>

                            <div className="flex flex-col items-center gap-2 text-sm md:items-end">
                                <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6 md:justify-end">
                                    <a href="https://www.fenetwork.my/about/" target="_blank" rel="noreferrer" className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.about_fen')}</a>
                                    <Link href={route('terms')} className="text-[#b8bdc8] transition hover:text-white">{t('landing.footer.terms')}</Link>
                                </div>
                                <p className="text-[#b8bdc8] text-center md:text-right">
                                    {t('landing.footer.support_text')}{' '}
                                    <a href="mailto:learn@fenetwork.my" className="transition hover:text-white">learn@fenetwork.my</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
