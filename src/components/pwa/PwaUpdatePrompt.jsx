import { useRegisterSW } from 'virtual:pwa-register/react'
import { TbRefresh } from 'react-icons/tb'

const PwaUpdatePrompt = () => {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW()

    if (!needRefresh) return null

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 max-w-xs">
            <TbRefresh className="text-primary text-xl shrink-0" />
            <p className="text-sm flex-1 heading-text">New version available!</p>
            <button
                onClick={() => updateServiceWorker(true)}
                className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shrink-0"
            >
                Update
            </button>
        </div>
    )
}

export default PwaUpdatePrompt
