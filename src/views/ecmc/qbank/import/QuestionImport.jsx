import { useEffect, useState, useRef } from 'react'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Switcher from '@/components/ui/Switcher'
import Spinner from '@/components/ui/Spinner'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import Table from '@/components/ui/Table'

const { THead, TBody, Tr, Th, Td } = Table
import {
    apiDownloadImportTemplate,
    apiImportQuestions,
    apiGetImportStatus,
    apiGetImportErrors,
    apiGetImportBatches,
    apiRollbackImportBatch,
} from '@/services/QBankService'
import {
    TbDownload, TbUpload, TbRefresh, TbTrash, TbCircleCheck,
    TbAlertCircle, TbClock, TbFileSpreadsheet,
} from 'react-icons/tb'

const BATCH_STATUS_COLORS = {
    pending: 'bg-gray-100 text-gray-600',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    partial: 'bg-amber-100 text-amber-700',
}

const BATCH_STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'partial', label: 'Partial' },
]

const QuestionImport = () => {
    const fileInputRef = useRef(null)
    const [file, setFile] = useState(null)
    const [dryRun, setDryRun] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activeBatch, setActiveBatch] = useState(null)
    const [pollInterval, setPollInterval] = useState(null)
    const [batches, setBatches] = useState([])
    const [batchFilter, setBatchFilter] = useState('')
    const [batchLoading, setBatchLoading] = useState(true)
    const [errors, setErrors] = useState([])
    const [errorsOpen, setErrorsOpen] = useState(false)

    const loadBatches = async () => {
        setBatchLoading(true)
        try {
            const params = batchFilter ? { status: batchFilter } : {}
            const res = await apiGetImportBatches(params)
            setBatches(res?.data || [])
        } catch {
            // silent
        } finally {
            setBatchLoading(false)
        }
    }

    useEffect(() => { loadBatches() }, [batchFilter])

    const downloadTemplate = async () => {
        try {
            const blob = await apiDownloadImportTemplate()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'questions_import_template.xlsx'
            a.click()
            URL.revokeObjectURL(url)
        } catch {
            toast.push(<Notification type="danger" title="Failed to download template" />, { placement: 'top-center' })
        }
    }

    const handleFileChange = (e) => {
        const f = e.target.files?.[0]
        if (f) setFile(f)
    }

    const handleUpload = async () => {
        if (!file) {
            toast.push(<Notification type="warning" title="Please select an Excel file" />, { placement: 'top-center' })
            return
        }
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('dry_run', dryRun ? '1' : '0')
            const res = await apiImportQuestions(formData)
            const batchId = res?.batch_id
            if (batchId) {
                setActiveBatch({ id: batchId, status: 'pending', progress_percent: 0 })
                toast.push(<Notification type="success" title={dryRun ? 'Dry run started' : 'Import started'} />, { placement: 'top-center' })
                startPolling(batchId)
            }
            setFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        } catch (err) {
            const msg = err?.response?.data?.message || 'Upload failed'
            toast.push(<Notification type="danger" title={msg} />, { placement: 'top-center' })
        } finally {
            setUploading(false)
        }
    }

    const startPolling = (batchId) => {
        const interval = setInterval(async () => {
            try {
                const res = await apiGetImportStatus(batchId)
                setActiveBatch(res)
                if (['completed', 'failed', 'partial'].includes(res?.status)) {
                    clearInterval(interval)
                    setPollInterval(null)
                    loadBatches()
                }
            } catch {
                clearInterval(interval)
                setPollInterval(null)
            }
        }, 2000)
        setPollInterval(interval)
    }

    useEffect(() => () => { if (pollInterval) clearInterval(pollInterval) }, [pollInterval])

    const viewErrors = async (batchId) => {
        try {
            const res = await apiGetImportErrors(batchId, 'json')
            setErrors(res?.errors || res?.data || [])
            setErrorsOpen(true)
        } catch {
            toast.push(<Notification type="danger" title="Failed to load error report" />, { placement: 'top-center' })
        }
    }

    const rollback = async (batchId) => {
        try {
            await apiRollbackImportBatch(batchId)
            toast.push(<Notification type="success" title="Batch rolled back" />, { placement: 'top-center' })
            loadBatches()
        } catch {
            toast.push(<Notification type="danger" title="Rollback failed" />, { placement: 'top-center' })
        }
    }

    return (
        <Container>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold">Import Questions</h3>
                        <p className="text-sm text-gray-500 mt-1">Bulk import questions from Excel (.xlsx)</p>
                    </div>
                    <Button icon={<TbDownload />} onClick={downloadTemplate}>
                        Download Template
                    </Button>
                </div>

                {/* Upload Card */}
                <AdaptiveCard>
                    <h5 className="font-semibold mb-4">Upload Excel File</h5>
                    <div className="flex flex-col gap-4">
                        <div
                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <TbFileSpreadsheet className="text-4xl text-gray-400 mx-auto mb-2" />
                            {file ? (
                                <p className="font-medium text-gray-700 dark:text-gray-300">{file.name}</p>
                            ) : (
                                <p className="text-gray-500">Click to select an .xlsx file, or drag and drop</p>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Switcher checked={dryRun} onChange={setDryRun} />
                            <div>
                                <p className="text-sm font-medium">Dry Run (Validation Only)</p>
                                <p className="text-xs text-gray-400">Validate the file without importing data</p>
                            </div>
                        </div>

                        <Button
                            variant="solid"
                            icon={<TbUpload />}
                            loading={uploading}
                            onClick={handleUpload}
                            disabled={!file}
                        >
                            {dryRun ? 'Validate File' : 'Import Questions'}
                        </Button>
                    </div>
                </AdaptiveCard>

                {/* Active batch progress */}
                {activeBatch && (
                    <AdaptiveCard>
                        <h5 className="font-semibold mb-3">Import Progress</h5>
                        <div className="flex items-center gap-3 mb-3">
                            {['pending', 'processing'].includes(activeBatch.status) ? (
                                <Spinner />
                            ) : activeBatch.status === 'completed' ? (
                                <TbCircleCheck className="text-2xl text-emerald-500" />
                            ) : (
                                <TbAlertCircle className="text-2xl text-red-500" />
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize font-medium">{activeBatch.status}</span>
                                    <span>{activeBatch.progress_percent ?? 0}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                        style={{ width: `${activeBatch.progress_percent ?? 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        {activeBatch.imported_count !== undefined && (
                            <div className="grid grid-cols-3 gap-3 text-center text-sm">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <p className="font-bold text-emerald-700">{activeBatch.imported_count}</p>
                                    <p className="text-gray-500">Imported</p>
                                </div>
                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="font-bold text-red-700">{activeBatch.failed_count}</p>
                                    <p className="text-gray-500">Failed</p>
                                </div>
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="font-bold text-gray-700">{activeBatch.total_rows}</p>
                                    <p className="text-gray-500">Total Rows</p>
                                </div>
                            </div>
                        )}
                        {activeBatch.failed_count > 0 && (
                            <Button size="sm" className="mt-3" icon={<TbDownload />} onClick={() => viewErrors(activeBatch.id)}>
                                View Errors
                            </Button>
                        )}
                    </AdaptiveCard>
                )}

                {/* Batch History */}
                <AdaptiveCard>
                    <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold">Import History</h5>
                        <div className="flex gap-2">
                            <Select
                                options={BATCH_STATUS_OPTIONS}
                                className="w-40"
                                defaultValue={BATCH_STATUS_OPTIONS[0]}
                                onChange={(opt) => setBatchFilter(opt?.value || '')}
                            />
                            <Button size="sm" icon={<TbRefresh />} onClick={loadBatches}>Refresh</Button>
                        </div>
                    </div>

                    {batchLoading ? (
                        <div className="flex justify-center py-8"><Spinner size="32px" /></div>
                    ) : (
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>Batch ID</Th>
                                    <Th>Status</Th>
                                    <Th>Total</Th>
                                    <Th>Imported</Th>
                                    <Th>Failed</Th>
                                    <Th>Progress</Th>
                                    <Th>Date</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {batches.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={8} className="text-center text-gray-400 py-8">No import history</Td>
                                    </Tr>
                                ) : batches.map((b) => (
                                    <Tr key={b.id}>
                                        <Td><span className="font-mono text-sm">{b.id}</span></Td>
                                        <Td>
                                            <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${BATCH_STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {b.status}
                                            </span>
                                        </Td>
                                        <Td>{b.total_rows ?? '—'}</Td>
                                        <Td className="text-emerald-600">{b.imported_count ?? '—'}</Td>
                                        <Td className="text-red-500">{b.failed_count ?? '—'}</Td>
                                        <Td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className="bg-blue-500 h-1.5 rounded-full"
                                                        style={{ width: `${b.progress_percent ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400">{b.progress_percent ?? 0}%</span>
                                            </div>
                                        </Td>
                                        <Td className="text-sm text-gray-500">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}</Td>
                                        <Td>
                                            <div className="flex gap-1">
                                                {(b.failed_count > 0 || b.status === 'partial') && (
                                                    <Button size="xs" icon={<TbAlertCircle />} onClick={() => viewErrors(b.id)} title="View Errors" />
                                                )}
                                                {b.status === 'completed' && (
                                                    <Button size="xs" variant="plain" className="text-red-500" icon={<TbTrash />} onClick={() => rollback(b.id)} title="Rollback" />
                                                )}
                                            </div>
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    )}
                </AdaptiveCard>

                {/* Errors Panel */}
                {errorsOpen && (
                    <AdaptiveCard>
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="font-semibold text-red-600">Error Report</h5>
                            <Button size="sm" onClick={() => setErrorsOpen(false)}>Close</Button>
                        </div>
                        {errors.length === 0 ? (
                            <p className="text-gray-400">No errors found</p>
                        ) : (
                            <Table>
                                <THead>
                                    <Tr>
                                        <Th>Row</Th>
                                        <Th>Field</Th>
                                        <Th>Error</Th>
                                        <Th>Value</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {errors.map((e, i) => (
                                        <Tr key={i}>
                                            <Td>{e.row}</Td>
                                            <Td>{e.field || '—'}</Td>
                                            <Td className="text-red-600">{e.message || e.error}</Td>
                                            <Td className="text-gray-400 text-sm font-mono">{String(e.value ?? '')}</Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        )}
                    </AdaptiveCard>
                )}
            </div>
        </Container>
    )
}

export default QuestionImport
