import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })

  const { propertyId } = params

  const favourite = await prisma.favourite.findUnique({
    where: { userId_propertyId: { userId: session.userId, propertyId } },
  })

  if (!favourite) {
    return NextResponse.json({ error: 'Favourite not found.' }, { status: 404 })
  }

  await prisma.favourite.delete({
    where: { userId_propertyId: { userId: session.userId, propertyId } },
  })

  return NextResponse.json({ success: true })
}
