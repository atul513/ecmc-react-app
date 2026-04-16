import { TbTrash } from 'react-icons/tb'
import Input from '@/components/ui/Input'

const InviteRecipientForm = ({ recipient, index, onChange, onRemove, canRemove }) => {
    const update = (field, value) => onChange(index, { ...recipient, [field]: value })

    return (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-[140px]">
                <Input
                    size="sm"
                    placeholder="Name"
                    value={recipient.name}
                    onChange={(e) => update('name', e.target.value)}
                />
            </div>
            <div className="flex-1 min-w-[160px]">
                <Input
                    size="sm"
                    type="email"
                    placeholder="Email"
                    value={recipient.email}
                    onChange={(e) => update('email', e.target.value)}
                />
            </div>
            <div className="flex-1 min-w-[130px]">
                <Input
                    size="sm"
                    placeholder="Phone (with country code)"
                    value={recipient.phone}
                    onChange={(e) => update('phone', e.target.value)}
                />
            </div>
            {canRemove && (
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                    <TbTrash size={16} />
                </button>
            )}
        </div>
    )
}

export default InviteRecipientForm
