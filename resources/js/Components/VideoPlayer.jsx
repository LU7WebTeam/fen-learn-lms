/**
 * VideoPlayer — enforces linear watching.
 *
 * Learners cannot seek past the furthest point they have already watched.
 * onWatchComplete() fires once when >= COMPLETION_THRESHOLD of the video
 * has been reached, unlocking the "Mark as Complete" button on the lesson page.
 *
 * Supported sources:
 *   • YouTube  — uses the IFrame Player API (loaded lazily)
 *   • Vimeo    — uses the Vimeo Player SDK (loaded lazily)
 *   • Direct   — native <video> element with seek-guard via timeupdate
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

const COMPLETION_THRESHOLD = 0.95; // 95 % watched → complete
const SEEK_TOLERANCE       = 2;    // seconds of grace for buffering / ads

// ─── URL detectors ───────────────────────────────────────────────────────────

function getYouTubeId(url) {
    if (!url) return null;
    const m = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/
    );
    return m ? m[1] : null;
}

function getVimeoId(url) {
    if (!url) return null;
    const m = url.match(/vimeo\.com\/(\d+)/);
    return m ? m[1] : null;
}

// ─── Lazy script loader (shared across multiple player mounts) ────────────────

function loadScript(src, onLoad) {
    if (document.querySelector(`script[src="${src}"]`)) {
        // Already injected; wait a tick in case it's still loading
        const check = () => {
            if (window.YT?.Player || window.Vimeo?.Player) onLoad();
            else setTimeout(check, 100);
        };
        check();
        return;
    }
    const s       = document.createElement('script');
    s.src         = src;
    s.onload      = onLoad;
    document.head.appendChild(s);
}

// ─── YouTube ─────────────────────────────────────────────────────────────────

const ytCallbacks = [];
let   ytLoading   = false;

function loadYouTubeAPI(cb) {
    if (window.YT?.Player) { cb(); return; }
    ytCallbacks.push(cb);
    if (ytLoading) return;
    ytLoading = true;

    window.onYouTubeIframeAPIReady = () => {
        ytCallbacks.splice(0).forEach(fn => fn());
    };
    loadScript('https://www.youtube.com/iframe_api', () => {
        // onYouTubeIframeAPIReady fires automatically after load
    });
}

function YouTubePlayer({ videoId, onWatchComplete, captionsDefault }) {
    const divRef     = useRef(null);
    const playerRef  = useRef(null);
    const maxRef     = useRef(0);
    const doneRef    = useRef(false);
    const timerRef   = useRef(null);

    useEffect(() => {
        let destroyed = false;

        loadYouTubeAPI(() => {
            if (destroyed || !divRef.current) return;

            playerRef.current = new window.YT.Player(divRef.current, {
                videoId,
                host: 'https://www.youtube-nocookie.com',
                playerVars: {
                    rel:           0, // no related videos at end
                    modestbranding:1, // removes YouTube logo from control bar
                    iv_load_policy:3, // no annotation cards
                    showinfo:      0, // no title overlay (legacy, still respected)
                    color:        'white',
                    cc_load_policy: captionsDefault ? 1 : 0,
                    cc_lang_pref:  'en',
                },
                events: {
                    onStateChange(e) {
                        const { PLAYING, PAUSED, ENDED, BUFFERING } = window.YT.PlayerState;
                        if (e.data === PLAYING || e.data === BUFFERING) {
                            clearInterval(timerRef.current);
                            timerRef.current = setInterval(guard, 500);
                        } else {
                            clearInterval(timerRef.current);
                        }
                        if (e.data === ENDED) markDone();
                    },
                },
            });
        });

        function guard() {
            const p = playerRef.current;
            if (!p?.getCurrentTime) return;
            const curr = p.getCurrentTime();
            const dur  = p.getDuration();
            if (curr > maxRef.current + SEEK_TOLERANCE) {
                p.seekTo(maxRef.current, true);
            } else {
                maxRef.current = Math.max(maxRef.current, curr);
                if (dur > 0 && maxRef.current / dur >= COMPLETION_THRESHOLD) markDone();
            }
        }

        function markDone() {
            if (doneRef.current) return;
            doneRef.current = true;
            onWatchComplete?.();
        }

        return () => {
            destroyed = true;
            clearInterval(timerRef.current);
            playerRef.current?.destroy?.();
        };
    }, [videoId, captionsDefault]);

    return (
        <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            {/* Covers the YouTube title bar / logo that appears at the top on hover */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-11 bg-black" />
            <div ref={divRef} className="h-full w-full" />
        </div>
    );
}

// ─── Vimeo ───────────────────────────────────────────────────────────────────

const vimeoCallbacks = [];
let   vimeoLoading   = false;

function loadVimeoAPI(cb) {
    if (window.Vimeo?.Player) { cb(); return; }
    vimeoCallbacks.push(cb);
    if (vimeoLoading) return;
    vimeoLoading = true;
    loadScript('https://player.vimeo.com/api/player.js', () => {
        vimeoCallbacks.splice(0).forEach(fn => fn());
    });
}

function VimeoPlayer({ videoId, onWatchComplete, captionsDefault }) {
    const divRef    = useRef(null);
    const playerRef = useRef(null);
    const maxRef    = useRef(0);
    const doneRef   = useRef(false);

    useEffect(() => {
        let destroyed = false;

        loadVimeoAPI(() => {
            if (destroyed || !divRef.current || !window.Vimeo) return;

            const p = new window.Vimeo.Player(divRef.current, {
                id:         videoId,
                responsive: true,
                title:      false,   // hide video title overlay
                byline:     false,   // hide author name
                portrait:   false,   // hide author avatar
                dnt:        true,    // do not track
                texttrack:  captionsDefault ? 'en' : null,
            });
            playerRef.current = p;

            p.on('timeupdate', ({ seconds, duration }) => {
                if (seconds > maxRef.current + SEEK_TOLERANCE) {
                    p.setCurrentTime(maxRef.current);
                } else {
                    maxRef.current = Math.max(maxRef.current, seconds);
                    if (duration > 0 && maxRef.current / duration >= COMPLETION_THRESHOLD) {
                        markDone();
                    }
                }
            });

            p.on('ended', markDone);
        });

        function markDone() {
            if (doneRef.current) return;
            doneRef.current = true;
            onWatchComplete?.();
        }

        return () => {
            destroyed = true;
            playerRef.current?.destroy?.();
        };
    }, [videoId, captionsDefault]);

    return (
        <div className="overflow-hidden rounded-xl">
            <div ref={divRef} />
        </div>
    );
}

// ─── Native <video> ───────────────────────────────────────────────────────────

function NativePlayer({ url, onWatchComplete }) {
    const videoRef = useRef(null);
    const maxRef   = useRef(0);
    const doneRef  = useRef(false);

    function handleTimeUpdate() {
        const v = videoRef.current;
        if (!v || isNaN(v.duration)) return;
        const curr = v.currentTime;
        const dur  = v.duration;

        if (curr > maxRef.current + SEEK_TOLERANCE) {
            v.currentTime = maxRef.current;
        } else {
            maxRef.current = Math.max(maxRef.current, curr);
            if (dur > 0 && maxRef.current / dur >= COMPLETION_THRESHOLD) markDone();
        }
    }

    function markDone() {
        if (doneRef.current) return;
        doneRef.current = true;
        onWatchComplete?.();
    }

    return (
        <div className="overflow-hidden rounded-xl bg-black">
            <video
                ref={videoRef}
                src={url}
                controls
                controlsList="nodownload"
                className="aspect-video w-full"
                onTimeUpdate={handleTimeUpdate}
                onEnded={markDone}
                onSeeked={handleTimeUpdate}
            />
        </div>
    );
}

// ─── Progress overlay ────────────────────────────────────────────────────────

function WatchedBadge({ watched }) {
    return (
        <div className={cn(
            'mt-3 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors',
            watched
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
        )}>
            <Eye className="h-4 w-4 shrink-0" />
            {watched
                ? 'Video watched — you can now mark this lesson as complete.'
                : 'Watch the video through to the end to unlock completion.'}
        </div>
    );
}

// ─── Public export ────────────────────────────────────────────────────────────

export default function VideoPlayer({ url, onWatchComplete, captionsDefault = false }) {
    const [watched, setWatched] = useState(false);

    function handleComplete() {
        if (watched) return;
        setWatched(true);
        onWatchComplete?.();
    }

    if (!url) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground">No video URL configured for this lesson.</p>
            </div>
        );
    }

    const ytId     = getYouTubeId(url);
    const vimeoId  = !ytId ? getVimeoId(url) : null;

    return (
        <div className="space-y-3">
            {ytId && (
                <YouTubePlayer
                    videoId={ytId}
                    onWatchComplete={handleComplete}
                    captionsDefault={captionsDefault}
                />
            )}
            {vimeoId && (
                <VimeoPlayer
                    videoId={vimeoId}
                    onWatchComplete={handleComplete}
                    captionsDefault={captionsDefault}
                />
            )}
            {!ytId && !vimeoId && <NativePlayer url={url} onWatchComplete={handleComplete} />}
            {captionsDefault && (
                <p className="text-xs text-muted-foreground">
                    Captions are set to open by default when the provider supports them.
                </p>
            )}
            <WatchedBadge watched={watched} />
        </div>
    );
}
