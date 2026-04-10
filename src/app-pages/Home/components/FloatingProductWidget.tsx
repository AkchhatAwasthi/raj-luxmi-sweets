'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, ExternalLink } from 'lucide-react';

// ─── Drop your video file in /public and set the filename here ────────────
const VIDEO_SRC = '/reel.mp4';
// ─────────────────────────────────────────────────────────────────────────

// Optional: link to your Instagram profile / reel page
const INSTAGRAM_LINK = 'https://www.instagram.com/rajluxmisweets/';

// Delay in ms before the widget appears — prevents reel.mp4 from downloading
// during the critical page-load window alongside LCP images and JS bundles.
const MOUNT_DELAY_MS = 3000;

const FloatingProductWidget = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [muted, setMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Delay widget mount so it doesn't compete with critical page-load assets
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), MOUNT_DELAY_MS);
        return () => clearTimeout(timer);
    }, []);

    if (!isMounted || !isVisible) return null;

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setMuted(video.muted);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 60, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="fixed bottom-6 left-6 z-40 group"
                style={{
                    width: 148,
                    height: 268,
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 0 0 2px #fff, 0 0 0 4px #e1306c, 0 12px 36px rgba(0,0,0,0.30)',
                }}
            >
                {/* ── Video ─────────────────────────────────────────────────── */}
                <video
                    ref={videoRef}
                    src={VIDEO_SRC}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* ── Gradient overlay (bottom) ──────────────────────────────── */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* ── Close button ───────────────────────────────────────────── */}
                <button
                    onClick={() => setIsVisible(false)}
                    aria-label="Close"
                    className="absolute top-2 right-2 z-30 flex items-center justify-center w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                >
                    <X className="w-3 h-3" />
                </button>

                {/* ── Mute / Unmute button ───────────────────────────────────── */}
                <button
                    onClick={toggleMute}
                    aria-label={muted ? 'Unmute' : 'Mute'}
                    className="absolute bottom-8 right-2 z-30 flex items-center justify-center w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
                >
                    {muted
                        ? <VolumeX className="w-3 h-3" />
                        : <Volume2 className="w-3 h-3" />
                    }
                </button>

                {/* ── Instagram link badge ───────────────────────────────────── */}
                <a
                    href={INSTAGRAM_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute bottom-2 left-2 z-30 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-white/80 hover:text-white transition-colors"
                    style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
                >
                    <ExternalLink className="w-2 h-2" />
                    <span className="text-[8px] tracking-wide">@rajluxmisweets</span>
                </a>
            </motion.div>
        </AnimatePresence>
    );
};

export default FloatingProductWidget;
