import { useState } from 'react'
import Button from '@/components/ui/Button'
import { TbCheck, TbAlertCircle } from 'react-icons/tb'

// Parses lines like: "Name, email@example.com, 919876543210"
const parseLine = (line) => {
    const parts = line.split(',').map((s) => s.trim())
    return {
        name: parts[0] || '',
        email: parts[1] || '',
        phone: parts[2] || '',
    }
}

const BulkRecipientInput = ({ onImport }) => {
    const [raw, setRaw] = useState('')
    const [preview, setPreview] = useState([])
    const [parsed, setParsed] = useState(false)

    const handleParse = () => {
        const lines = raw.split('\n').filter((l) => l.trim())
        const results = lines.map(parseLine).filter((r) => r.name || r.email)
        setPreview(results)
        setParsed(true)
    }

    const handleImport = () => {
        onImport(preview)
        setRaw('')
        setPreview([])
        setParsed(false)
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Paste recipients — one per line: <span className="font-mono text-gray-400">Name, email, phone</span>
                </label>
                <textarea
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono"
                    rows={5}
                    placeholder={`Rahul Sharma, rahul@example.com, 919876543210\nPriya Patel, priya@example.com, 919876543211`}
                    value={raw}
                    onChange={(e) => { setRaw(e.target.value); setParsed(false); setPreview([]) }}
                />
            </div>

            {!parsed ? (
                <Button size="sm" onClick={handleParse} disabled={!raw.trim()}>
                    Preview {raw.trim().split('\n').filter(Boolean).length || ''} recipients
                </Button>
            ) : (
                <div className="space-y-2">
                    <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700/40 px-3 py-2 text-xs font-medium text-gray-500 flex items-center gap-2">
                            <TbCheck size={13} className="text-emerald-500" />
                            {preview.length} recipients parsed
                        </div>
                        <div className="max-h-36 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                            {preview.map((r, i) => (
                                <div key={i} className="flex items-center gap-3 px-3 py-1.5 text-xs">
                                    <span className="font-medium text-gray-700 dark:text-gray-200 w-28 truncate">{r.name || <span className="text-red-400 italic">no name</span>}</span>
                                    <span className="text-gray-400 flex-1 truncate">{r.email || <span className="text-amber-400 italic">no email</span>}</span>
                                    <span className="text-gray-400">{r.phone}</span>
                                    {(!r.name || !r.email) && <TbAlertCircle size={12} className="text-amber-400 shrink-0" />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="solid" onClick={handleImport}>
                            Import {preview.length} recipients
                        </Button>
                        <Button size="sm" onClick={() => { setParsed(false); setPreview([]) }}>
                            Edit
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BulkRecipientInput
