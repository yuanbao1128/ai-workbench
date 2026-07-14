import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface SettingsInput {
  apiProvider: string
  apiKey: string
  model: string
  baseUrl?: string
}

export async function GET() {
  let settings = await prisma.setting.findUnique({
    where: { id: 'app-settings' },
  })

  if (!settings) {
    settings = await prisma.setting.create({
      data: { id: 'app-settings' },
    })
  }

  return NextResponse.json({
    ...settings,
    apiKey: settings.apiKey ? maskApiKey(settings.apiKey) : '',
  })
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as SettingsInput
  const { apiProvider, apiKey, model, baseUrl } = body

  const settings = await prisma.setting.upsert({
    where: { id: 'app-settings' },
    update: {
      apiProvider: apiProvider || 'anthropic',
      apiKey: apiKey || '',
      model: model || 'claude-sonnet-5',
      baseUrl: baseUrl || null,
    },
    create: {
      id: 'app-settings',
      apiProvider: apiProvider || 'anthropic',
      apiKey: apiKey || '',
      model: model || 'claude-sonnet-5',
      baseUrl: baseUrl || null,
    },
  })

  // Sync env vars for current request/runtime
  if (apiProvider) process.env.AI_PROVIDER = apiProvider
  if (apiKey) {
    if (apiProvider === 'openai') {
      process.env.OPENAI_API_KEY = apiKey
    } else {
      process.env.ANTHROPIC_API_KEY = apiKey
    }
  }
  if (model) process.env.AI_MODEL = model
  if (baseUrl) process.env.AI_BASE_URL = baseUrl

  return NextResponse.json({
    ...settings,
    apiKey: maskApiKey(settings.apiKey),
  })
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 4) + '••••••••' + key.slice(-4)
}