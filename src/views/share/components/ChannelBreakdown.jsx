import { TbMail, TbBrandWhatsapp, TbPhone } from 'react-icons/tb'

const CHANNELS = [
    { key: 'email',    label: 'Email',     icon: TbMail,           color: 'bg-blue-500',    light: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' },
    { key: 'whatsapp', label: 'WhatsApp',  icon: TbBrandWhatsapp,  color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300' },
    { key: 'sms',      label: 'SMS',       icon: TbPhone,          color: 'bg-amber-500',   light: 'bg-amber-50 text-amber-600 dark:bg-amberald-900/20 dark:text-amber-300' },
]

const ChannelBreakdown = ({ channels = {} }) => {
    const total = Object.values(channels).reduce((a, b) => a + (b || 0), 0) || 1

    return (
        <div className="grid grid-cols-3 gap-3">
            {CHANNELS.map(({ key, label, icon: Icon, color, light }) => {
                const count = channels[key] ?? 0
                const pct = Math.round((count / total) * 100)
                return (
                    <div key={key} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${light}`}>
                            <Icon size={18} />
                        </div>
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-100">{count}</span>
                        <span className="text-xs text-gray-400">{label}</span>
                        {total > 1 && <span className="text-[10px] text-gray-300 dark:text-gray-600">{pct}%</span>}
                    </div>
                )
            })}
        </div>
    )
}

export default ChannelBreakdown
