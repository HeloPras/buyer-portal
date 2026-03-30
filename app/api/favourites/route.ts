import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const favourites = await prisma.favourite.findMany({
    where: { userId: session.userId },
    include: { property: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ favourites })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const body = await req.json()
  const { propertyId } = body

  if (!propertyId || typeof propertyId !== 'string') {
    return NextResponse.json({ error: 'propertyId is required.' }, { status: 400 })
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) {
    return NextResponse.json({ error: 'Property not found.' }, { status: 404 })
  }

  try {
    const favourite = await prisma.favourite.create({
      data: { userId: session.userId, propertyId },
      include: { property: true },
    })
    return NextResponse.json({ favourite }, { status: 201 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Already in favourites.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
