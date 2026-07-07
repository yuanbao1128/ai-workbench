import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  let settings = await prisma.setting.findUnique({
    where: { id: 'app-settings' },
  })

  if (!settings) {
    settings = await prisma.setting.create({
      data: { id: 'app-settings' },
    })
  }

  // Return settings with masked API key
  return NextResponse.json({
    ...settings,
    apiKey: settings.apiKey ? maskApiKey(settings.apiKey) : '',
  })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { apiProvider, apiKey, model, baseUrl } = body

  const settings = await prisma.setting.upsert({
    where: { id: 'app-settings' },
    update: {
      apiProvider: apiProvider || 'anthropic',
      apiKey: apiKey || '', // In production, encrypt this
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

  return NextResponse.json({
    ...settings,
    apiKey: maskApiKey(settings.apiKey),
  })
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 4) + '••••••••' + key.slice(-4)
}