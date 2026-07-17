import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const settings = await prisma.setting.findUnique({
      where: { id: 'app-settings' },
    })

    if (!settings || !settings.apiKey) {
      return NextResponse.json({ success: false, error: '未配置 API Key' })
    }

    const provider = settings.apiProvider || 'anthropic'
    let url: string
    let headers: Record<string, string>

    if (provider === 'openai') {
      url = (settings.baseUrl || 'https://api.openai.com') + '/v1/models'
      headers = { Authorization: `Bearer ${settings.apiKey}` }
    } else {
      url = (settings.baseUrl || 'https://api.anthropic.com') + '/v1/messages'
      headers = {
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      }
    }

    const res = await fetch(url, {
      method: provider === 'openai' ? 'GET' : 'POST',
      headers,
      body: provider !== 'openai'
        ? JSON.stringify({ model: settings.model || 'claude-sonnet-5', max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] })
        : undefined,
      signal: AbortSignal.timeout(10000),
    })

    if (res.ok) {
      return NextResponse.json({ success: true })
    }

    const errorBody = await res.text().catch(() => '')
    return NextResponse.json({ success: false, error: `API 返回 ${res.status}: ${errorBody.slice(0, 100)}` })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '连接失败'
    return NextResponse.json({ success: false, error: msg })
  }
}
