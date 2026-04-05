import { useState, useEffect } from 'react'
import { TbX, TbShare, TbSquarePlus, TbBolt, TbWifi, TbBell } from 'react-icons/tb'

// ─── Detection helpers ────────────────────────────────────────────────────────

const isMobile = () =>
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent))

const isIos = () =>
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent))

const isInStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true

const DISMISSED_KEY = 'pwa_prompt_dismissed_v2'
const wasDismissed = () => {
    try { return !!localStorage.getItem(DISMISSED_KEY) } catch { return false }
}
const markDismissed = () => {
    try { localStorage.setItem(DISMISSED_KEY, '1') } catch {}
}

const perks = [
    { icon: TbBolt,  text: 'Faster load times' },
    { icon: TbWifi,  text: 'Works offline' },
    { icon: TbBell,  text: 'Quick access from Home Screen' },
]

// ─── Shared suggestion card ───────────────────────────────────────────────────

const SuggestionCard = ({ onClose, children, iosSteps }) => (
    <div
        className="fixed inset-0 z-[9998] flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
    >
        {/* Stop click-through on the card itself */}
        <div
            className="relative w-full max-w-sm mb-4 mx-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideUp 0.3s ease-out' }}
        >
            {/* gradient top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-400 to-primary" />

            <div className="px-5 pt-5 pb-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <img
                        src="/icons/icon.svg"
                        alt="ECMC"
                        className="w-12 h-12 rounded-2xl shadow-md shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold heading-text text-base leading-tight">
                            Add ECMC to your Home Screen
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Get the full app experience — free
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 -mt-0.5"
                    >
                        <TbX size={20} />
                    </button>
                </div>

                {/* Perks */}
                <div className="flex justify-between mb-5">
                    {perks.map(({ icon: Icon, text }) => (
                        <div key={text} className="flex flex-col items-center gap-1.5 flex-1">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Icon className="text-primary text-xl" />
                            </div>
                            <span className="text-[11px] text-gray-500 text-center leading-tight">{text}</span>
                        </div>
                    ))}
                </div>

                {children}
            </div>

            {/* pointer arrow for iOS */}
            {iosSteps && (
                <div className="pb-4 flex justify-center">
                    <div className="flex flex-col items-center gap-1 text-primary text-xs font-medium animate-bounce">
                        <span>Tap Share below</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </div>
                </div>
            )}
        </div>

        <style>{`
            @keyframes slideUp {
                from { transform: translateY(60px); opacity: 0; }
                to   { transform: translateY(0);    opacity: 1; }
            }
        `}</style>
    </div>
)

// ─── Android variant ──────────────────────────────────────────────────────────

const AndroidSuggestion = ({ onInstall, onClose }) => (
    <SuggestionCard onClose={onClose}>
        <button
            onClick={onInstall}
            className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:opacity-90 active:opacity-80 transition-opacity"
        >
            Add to Home Screen
        </button>
        <button
            onClick={onClose}
            className="w-full mt-2 py-2.5 rounded-2xl text-sm text-gray-500 font-medium"
        >
            Not now
        </button>
    </SuggestionCard>
)

// ─── iOS variant ──────────────────────────────────────────────────────────────

const IosSuggestion = ({ onClose }) => (
    <SuggestionCard onClose={onClose} iosSteps>
        <ol className="space-y-3 mb-4">
            <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    Tap{' '}
                    <TbShare className="inline text-primary text-base align-middle" />{' '}
                    <strong className="heading-text">Share</strong> at the bottom of Safari
                </span>
            </li>
            <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    Tap{' '}
                    <TbSquarePlus className="inline text-primary text-base align-middle" />{' '}
                    <strong className="heading-text">Add to Home Screen</strong>
                </span>
            </li>
            <li className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    Tap <strong className="heading-text">Add</strong> to confirm
                </span>
            </li>
        </ol>
        <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl text-sm text-gray-500 font-medium"
        >
            Maybe later
        </button>
    </SuggestionCard>
)

// ─── Main Component ───────────────────────────────────────────────────────────

const PwaInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showAndroid, setShowAndroid] = useState(false)
    const [showIos, setShowIos] = useState(false)

    useEffect(() => {
        if (isInStandaloneMode() || wasDismissed() || !isMobile()) return

        if (isIos()) {
            const t = setTimeout(() => setShowIos(true), 4000)
            return () => clearTimeout(t)
        }

        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            // slight delay so user has landed on the page first
            setTimeout(() => setShowAndroid(true), 4000)
        }
        window.addEventListener('beforeinstallprompt', handler)
        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const dismiss = () => {
        markDismissed()
        setShowAndroid(false)
        setShowIos(false)
    }

    const installAndroid = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') markDismissed()
        setDeferredPrompt(null)
        setShowAndroid(false)
    }

    if (showIos) return <IosSuggestion onClose={dismiss} />
    if (showAndroid) return <AndroidSuggestion onInstall={installAndroid} onClose={dismiss} />
    return null
}

export default PwaInstallPrompt
