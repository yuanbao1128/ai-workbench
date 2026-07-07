'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [provider, setProvider] = useState('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('claude-sonnet-5')
  const [baseUrl, setBaseUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((data) => {
          setProvider(data.apiProvider || 'anthropic')
          setApiKey(data.apiKey || '')
          setModel(data.model || 'claude-sonnet-5')
          setBaseUrl(data.baseUrl || '')
        })
        .catch(() => {})
    }
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiProvider: provider,
        apiKey,
        model,
        baseUrl: baseUrl || null,
      }),
    })
    setSaving(false)
    onClose()
  }

  const handleTest = async () => {
    setTestResult(null)
    try {
      // Test by making a simple API call
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '你好' }),
      })
      if (res.ok) {
        setTestResult('✅ 连接成功')
      } else {
        setTestResult('❌ 连接失败')
      }
    } catch {
      setTestResult('❌ 连接失败')
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-bold text-gray-900 mb-4">AI 模型配置</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API 提供商</label>
          <select
            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            type="password"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="sk-ant-api03-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">模型</label>
          <select
            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {provider === 'anthropic' && (
              <>
                <option value="claude-sonnet-5">claude-sonnet-5</option>
                <option value="claude-opus-4-8">claude-opus-4-8</option>
                <option value="claude-haiku-4-5">claude-haiku-4-5</option>
              </>
            )}
            {provider === 'openai' && (
              <>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
              </>
            )}
            {provider === 'custom' && (
              <option value={model}>{model}</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Base URL（可选）</label>
          <input
            type="text"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="https://api.anthropic.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>

        {testResult && (
          <div className={`text-sm font-medium ${testResult.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {testResult}
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Button variant="ghost" onClick={handleTest}>测试连接</Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>取消</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}