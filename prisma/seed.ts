import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const properties = [
  {
    title: 'Sunlit Loft in Thamel',
    address: 'Thamel, Kathmandu',
    price: 12500000,
    type: 'Apartment',
    bedrooms: 2,
    imageSlug: 'thamel-loft',
  },
  {
    title: 'Modern Villa with Garden',
    address: 'Budhanilkantha, Kathmandu',
    price: 45000000,
    type: 'Villa',
    bedrooms: 4,
    imageSlug: 'budhanilkantha-villa',
  },
  {
    title: 'Compact Studio near Patan',
    address: 'Lagankhel, Lalitpur',
    price: 7800000,
    type: 'Studio',
    bedrooms: 1,
    imageSlug: 'patan-studio',
  },
  {
    title: 'Family Home in Bhaktapur',
    address: 'Suryabinayak, Bhaktapur',
    price: 28000000,
    type: 'House',
    bedrooms: 3,
    imageSlug: 'bhaktapur-house',
  },
  {
    title: 'Penthouse with Valley View',
    address: 'Lazimpat, Kathmandu',
    price: 65000000,
    type: 'Penthouse',
    bedrooms: 3,
    imageSlug: 'lazimpat-penthouse',
  },
  {
    title: 'Quiet Cottage in Godavari',
    address: 'Godavari, Lalitpur',
    price: 18500000,
    type: 'Cottage',
    bedrooms: 2,
    imageSlug: 'godavari-cottage',
  },
]

async function main() {
  console.log('Seeding properties...')
  for (const property of properties) {
    await prisma.property.upsert({
      where: { id: property.imageSlug },
      update: {},
      create: { id: property.imageSlug, ...property },
    })
  }
  console.log(`Seeded ${properties.length} properties.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
