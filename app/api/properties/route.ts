import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const properties = await prisma.property.findMany({ orderBy: { title: 'asc' } })
  return NextResponse.json({ properties })
}
