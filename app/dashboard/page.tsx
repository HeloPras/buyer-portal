import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [properties, favourites] = await Promise.all([
    prisma.property.findMany({ orderBy: { title: 'asc' } }),
    prisma.favourite.findMany({
      where: { userId: session.userId },
      select: { propertyId: true },
    }),
  ])

  const favouriteIds = new Set(favourites.map((f) => f.propertyId))

  return (
    <DashboardClient
      user={session}
      properties={properties}
      initialFavouriteIds={[...favouriteIds]}
    />
  )
}
