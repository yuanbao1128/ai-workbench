'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ConclusionModalProps {
  open: boolean
  onClose: () => void
  onSave: (conclusion: string, status: string) => void
}

export function ConclusionModal({ open, onClose, onSave }: ConclusionModalProps) {
  const [conclusion, setConclusion] = useState('')
  const [status, setStatus] = useState('REPLIED')

  const handleSave = () => {
    onSave(conclusion, status)
    setConclusion('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-gray-900 mb-4">记录结论</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">结论内容</label>
          <textarea
            className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[100px] outline-none focus:border-primary"
            placeholder="开发回复的内容..."
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="REPLIED">已回复</option>
            <option value="RESOLVED">已解决</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSave}>保存</Button>
        </div>
      </div>
    </Modal>
  )
}