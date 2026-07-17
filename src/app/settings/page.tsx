'use client'

import { useState, useEffect } from 'react'

interface SettingsData {
  apiProvider: string
  apiKey: string
  model: string
  baseUrl?: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    apiProvider: 'anthropic',
    apiKey: '',
    model: 'claude-sonnet-5',
    baseUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [testing, setTesting] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setSettings(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          apiKey: keyInput || settings.apiKey,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setSettings(updated)
        showToast('设置已保存 ✅')
      }
    } catch {
      showToast('保存失败')
    }
    setSaving(false)
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const res = await fetch('/api/settings/test-connection', { method: 'POST' })
      const data = await res.json()
      showToast(data.success ? '连接成功 ✅' : `连接失败: ${data.error}`)
    } catch {
      showToast('测试连接失败')
    }
    setTesting(false)
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">⚙️ 系统设置</h1>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">⚙️ 系统设置</h1>

      {/* AI Configuration */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">AI 配置</h2>

        <div className="space-y-4">
          {/* API Provider */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">AI 提供商</label>
            <select
              value={settings.apiProvider}
              onChange={(e) => setSettings({ ...settings, apiProvider: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">API Key</label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={keyInput || (settings.apiKey ? '••••••••' : '')}
                onChange={(e) => setKeyInput(e.target.value)}
                onFocus={() => { if (!keyInput) setKeyInput('') }}
                placeholder="输入 API Key"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">模型</label>
            <input
              type="text"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="claude-sonnet-5"
            />
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">API Base URL (可选)</label>
            <input
              type="text"
              value={settings.baseUrl || ''}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="https://api.anthropic.com"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 disabled:opacity-50"
            >
              {testing ? '测试中...' : '🔌 测试连接'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? '保存中...' : '💾 保存设置'}
            </button>
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">通知设置</h2>

        <div className="space-y-3">
          {[
            { id: 'morning', label: '🌅 早晨提醒', desc: '每天早上 9:00 提醒当日任务' },
            { id: 'followup', label: '📌 追问提醒', desc: '委托追问到期时提醒' },
            { id: 'daily', label: '📝 日报通知', desc: '日报生成后通知' },
            { id: 'weekly', label: '📊 周报通知', desc: '周报生成后通知' },
          ].map((item) => (
            <label key={item.id} className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-sm text-gray-700">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60] px-4 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg animate-toast">
          {toast}
        </div>
      )}
    </div>
  )
}
