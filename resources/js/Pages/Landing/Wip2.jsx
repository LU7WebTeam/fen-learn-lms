import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Award, CheckCircle, Clock } from 'lucide-react';

export default function Wip2() {
    const { platform, auth } = usePage().props;
    const platformName = platform?.name || 'FEN E-Learning Platform';

    return (
        <div className="min-h-screen bg-white font-['Lexend',sans-serif] text-slate-600">
            <Head>
                <title>{platformName}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Lexend:wght@300..700&display=swap" rel="stylesheet" />
            </Head>

            {/* Navbar */}
            <nav className="flex justify-between items-center py-5 px-8 max-w-7xl mx-auto bg-white">
                <Link href="/" className="flex items-center gap-2">
                    {platform?.logo_url ? (
                        <div className="w-10 h-10 overflow-hidden flex items-center justify-center">
                            <img src={platform.logo_url} alt={platformName} className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            {platformName.charAt(0)}
                        </div>
                    )}
                    <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-slate-900 text-xl">
                        {platformName}
                    </span>
                </Link>
                <div className="hidden md:flex items-center gap-8 font-medium">
                    <a href="#home" className="hover:text-slate-900 transition">Home</a>
                    <Link href={route('courses.index')} className="hover:text-slate-900 transition">Courses</Link>
                    <a href="#features" className="hover:text-slate-900 transition">Features</a>
                    <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
                </div>
                <div>
                    {auth?.user ? (
                        <Link href={route('dashboard')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition font-medium">
                            My Dashboard
                        </Link>
                    ) : (
                        <div className="flex gap-4 items-center">
                            <Link href={route('login')} className="font-medium hover:text-slate-900 hidden sm:block">
                                Login
                            </Link>
                            <Link href={route('register')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition font-medium">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section id="home" className="max-w-7xl mx-auto px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h1 className="font-['Bricolage_Grotesque',sans-serif] text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                        Kickstart Your Financial Management Journey with {platformName}
                    </h1>
                    <p className="text-xl font-medium text-slate-800">
                        Secure and flexible e learning platform to help you feel more confident to manage your finances.
                    </p>
                    <p className="text-lg leading-relaxed text-slate-600">
                        {platformName} is brought to you by the Financial Education Network (FEN), an inter-agency platform comprising institutions and agencies committed to improving the financial literacy of Malaysians.
                    </p>
                    <div className="pt-4">
                        <Link href={route('register')} className="inline-block bg-slate-900 text-white px-8 py-3.5 rounded-full hover:bg-slate-800 transition font-medium text-lg shadow-lg shadow-slate-200">
                            Register for Free
                        </Link>
                    </div>
                </div>
                <div className="relative flex justify-center items-center">
                    {/* Soft gradient blob shape */}
                    <div className="absolute w-[120%] h-[120%] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-[3rem] rotate-3 transform z-0"></div>
                    <img 
                        src="https://placehold.co/600x600/transparent/334155?text=Happy+Student+Cutout" 
                        alt="Happy student cutout" 
                        className="relative z-10 w-full max-w-md object-contain mix-blend-multiply"
                    />
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-16">
                <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-3xl md:rounded-[2.5rem] p-6 md:p-16 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-4xl font-bold text-slate-900">
                                Why Choose FEN?
                            </h2>
                            <p className="text-lg text-slate-700">
                                Experience a platform built specifically to empower Malaysians with vital financial skills.
                            </p>
                            <a href="#features" className="inline-block bg-slate-900 text-white px-8 py-3 rounded-full hover:bg-slate-800 transition font-medium shadow-md">
                                Learn More
                            </a>
                        </div>
                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Feature 1 */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                                <Clock className="w-8 h-8 text-blue-600 mb-4" />
                                <h3 className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-slate-900 mb-2">Learn anytime, anywhere</h3>
                                <p className="text-slate-600">Learn at your own pace with fully flexible online programmes, making financial learning convenient and accessible for everyone.</p>
                            </div>
                            {/* Feature 2 */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                                <BookOpen className="w-8 h-8 text-purple-600 mb-4" />
                                <h3 className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-slate-900 mb-2">Enrol anytime, free of charge</h3>
                                <p className="text-slate-600">There are no fees and no fixed enrolment periods. Begin building essential financial skills, at no cost!</p>
                            </div>
                            {/* Feature 3 */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                                <Award className="w-8 h-8 text-pink-600 mb-4" />
                                <h3 className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-slate-900 mb-2">Receive a certificate</h3>
                                <p className="text-slate-600">Earn a certificate of participation upon completion of the modules that validates your commitment to improving your financial literacy.</p>
                            </div>
                            {/* Feature 4 */}
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
                                <CheckCircle className="w-8 h-8 text-teal-600 mb-4" />
                                <h3 className="font-['Bricolage_Grotesque',sans-serif] text-xl font-bold text-slate-900 mb-2">Designed by experts</h3>
                                <p className="text-slate-600">The content is developed by FEN’s subject matter experts ensuring accuracy, quality, and relevance to the target segment.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Course Spotlight */}
            <section className="bg-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="lg:w-1/2 w-full">
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-sm aspect-square max-h-[600px] bg-slate-200">
                            <img 
                                src="https://placehold.co/800x800/dbeafe/1e293b?text=Student+Focus" 
                                alt="Student learning" 
                                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
                            />
                        </div>
                    </div>
                    <div className="lg:w-1/2 space-y-6">
                        <h2 className="font-['Bricolage_Grotesque',sans-serif] text-4xl md:text-5xl font-extrabold text-slate-900">
                            FEN PROAKTIF 2.0
                        </h2>
                        <div className="space-y-4 text-slate-600 text-lg">
                            <p>
                                FEN PROAKTIF 2.0 is an online financial education programme designed to help young Malaysians to build the money skills they need for the digital age and the first few years of working life.
                            </p>
                            <p className="font-medium text-slate-800 border-l-4 border-blue-400 pl-4 py-1">
                                Achieving financial stability is not just about earning more, it is about being in control of what you have.
                            </p>
                            <p>
                                Achieve financial well‑being, not burdens, by understanding your cash flow, protecting what matters, and making smarter decisions for your future.
                            </p>
                            <p>
                                FEN PROAKTIF 2.0 helps you build the confidence you need to manage your finances from today onwards.
                            </p>
                        </div>
                        <div className="pt-6 flex flex-wrap gap-4">
                            <Link href={route('register')} className="bg-slate-900 text-white px-8 py-3.5 rounded-full hover:bg-slate-800 transition font-medium shadow-md">
                                Register and Enroll
                            </Link>
                            <Link href={route('courses.index')} className="bg-white text-slate-900 border border-slate-200 px-8 py-3.5 rounded-full hover:bg-slate-50 transition font-medium shadow-sm">
                                View Course
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* What You Will Learn Section */}
            <section className="bg-white py-24 px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1">
                        <h2 className="font-['Bricolage_Grotesque',sans-serif] text-4xl lg:text-5xl font-extrabold text-slate-900 sticky top-8">
                            What you will learn
                        </h2>
                    </div>
                    <div className="lg:col-span-2 space-y-12">
                        {[
                            { num: "01", title: "Cash Flow Management", desc: "Learn how to keep track of your money so you always know where it is going and stay in control." },
                            { num: "02", title: "Debt Management", desc: "Understand how to handle debt wisely and avoid money stress before it starts." },
                            { num: "03", title: "Building Wealth", desc: "Discover ways to grow your money over time, even if you are just starting out." },
                            { num: "04", title: "Financial Risk Management", desc: "Learn how to protect yourself and your future by managing financial risks confidently." },
                            { num: "05", title: "Digital Financial Literacy", desc: "Get smart about money in the digital era from online banking to staying safe from scams." },
                        ].map((item, idx) => (
                            <div key={idx} className={`flex gap-6 items-start ${idx % 2 !== 0 ? 'lg:ml-12' : ''}`}>
                                <div className="text-5xl font-extrabold font-['Bricolage_Grotesque',sans-serif] text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-pink-500">
                                    {item.num}.
                                </div>
                                <div className="space-y-3 pt-2 lg:pt-3">
                                    <h3 className="font-['Bricolage_Grotesque',sans-serif] text-2xl font-bold text-slate-900">{item.title}</h3>
                                    <p className="text-lg text-slate-600 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs Section */}
            <section id="faq" className="bg-slate-50 py-24 px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-['Bricolage_Grotesque',sans-serif] text-4xl font-bold text-slate-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-slate-600">
                            Got questions? We've got answers.
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            {
                                q: "What do I need to register?",
                                a: "Students: Full name, email, student ID, university/institution, field of study. Individuals: Full name and email."
                            },
                            {
                                q: "What if I forget my password?",
                                a: "You can reset it easily using the “Forgot Password” option."
                            },
                            {
                                q: "Do I need to follow the module order?",
                                a: "Yes, you must complete each module before moving to the next."
                            },
                            {
                                q: "What is the passing score?",
                                a: "You need at least 60% to earn a certificate. You may repeat the pre survey and post survey if you have not achieved the required score."
                            },
                            {
                                q: "How do I get my certificate?",
                                a: "You can download it from the platform or receive it by email."
                            }
                        ].map((faq, idx) => (
                            <details key={idx} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-slate-900">
                                    <span className="font-['Bricolage_Grotesque',sans-serif] text-lg font-bold">{faq.q}</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" w="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <div className="text-slate-600 px-6 pb-6 pt-0 leading-relaxed">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-8 text-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        {platform?.logo_url ? (
                            <div className="w-8 h-8 overflow-hidden bg-white/10 rounded p-1">
                                <img src={platform.logo_url} alt={platformName} className="w-full h-full object-contain" />
                            </div>
                        ) : (
                            <span className="font-['Bricolage_Grotesque',sans-serif] font-bold text-white text-lg">{platformName.charAt(0)}</span>
                        )}
                        {!platform?.logo_url && <span className="text-slate-500">|</span>}
                        <span>&copy; {new Date().getFullYear()} {platformName}. All rights reserved.</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <Link href={route('about')} className="hover:text-white transition">About Us</Link>
                        <Link href={route('terms')} className="hover:text-white transition">Terms of Service</Link>
                        <Link href={route('privacy')} className="hover:text-white transition">Privacy Policy</Link>
                        <span className="w-1 h-1 bg-slate-700 rounded-full hidden md:block"></span>
                        <Link href={route('courses.index')} className="hover:text-white transition font-medium">Browse Courses</Link>
                        {!auth?.user && (
                            <Link href={route('login')} className="hover:text-white transition font-medium">Admin & Staff Login</Link>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}
