const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create dummy users first
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah.traveller@example.com' },
      update: {},
      create: {
        email: 'sarah.traveller@example.com',
        name: 'Sarah',
        lastName: 'Johnson',
        password: hashedPassword,
        emailVerified: new Date(),
        rating: 4.8,
        totalTrips: 15,
        completedTrips: 14,
      }
    }),
    prisma.user.upsert({
      where: { email: 'mike.sender@example.com' },
      update: {},
      create: {
        email: 'mike.sender@example.com',
        name: 'Mike',
        lastName: 'Chen',
        password: hashedPassword,
        emailVerified: new Date(),
        rating: 4.6,
        totalTrips: 8,
        completedTrips: 7,
      }
    }),
    prisma.user.upsert({
      where: { email: 'anna.globe@example.com' },
      update: {},
      create: {
        email: 'anna.globe@example.com',
        name: 'Anna',
        lastName: 'Rodriguez',
        password: hashedPassword,
        emailVerified: new Date(),
        rating: 4.9,
        totalTrips: 23,
        completedTrips: 22,
      }
    }),
    prisma.user.upsert({
      where: { email: 'david.items@example.com' },
      update: {},
      create: {
        email: 'david.items@example.com',
        name: 'David',
        lastName: 'Kim',
        password: hashedPassword,
        emailVerified: new Date(),
        rating: 4.7,
        totalTrips: 11,
        completedTrips: 10,
      }
    }),
  ])

  // Create traveller posts
  const travellerPosts = await Promise.all([
    prisma.travellerPost.create({
      data: {
        userId: users[0].id,
        departureCountry: 'Canada',
        departureCity: 'Toronto',
        departureAirport: 'YYZ',
        departureDate: new Date('2024-02-15'),
        departureTime: '14:30',
        arrivalCountry: 'Iran',
        arrivalCity: 'Tehran',
        arrivalAirport: 'IKA',
        arrivalDate: new Date('2024-02-16'),
        arrivalTime: '18:45',
        availableWeight: 15.5,
        pricePerKg: 8.50,
        specialNotes: 'Happy to help with documents and small gifts. No electronics or fragile items please.',
        pickupLocation: 'Downtown Toronto',
        deliveryLocation: 'Tehran Airport or city center',
        status: 'ACTIVE'
      }
    }),
    prisma.travellerPost.create({
      data: {
        userId: users[2].id,
        departureCountry: 'United States',
        departureCity: 'New York',
        departureAirport: 'JFK',
        departureDate: new Date('2024-02-20'),
        departureTime: '22:15',
        arrivalCountry: 'France',
        arrivalCity: 'Paris',
        arrivalAirport: 'CDG',
        arrivalDate: new Date('2024-02-21'),
        arrivalTime: '11:30',
        availableWeight: 20.0,
        pricePerKg: 12.00,
        specialNotes: 'Business traveler with extra luggage space. Can handle clothing, books, and small electronics.',
        pickupLocation: 'Manhattan area',
        deliveryLocation: 'Paris city center',
        status: 'ACTIVE'
      }
    }),
    prisma.travellerPost.create({
      data: {
        userId: users[0].id,
        departureCountry: 'United Kingdom',
        departureCity: 'London',
        departureAirport: 'LHR',
        departureDate: new Date('2024-03-01'),
        departureTime: '09:45',
        arrivalCountry: 'Germany',
        arrivalCity: 'Berlin',
        arrivalAirport: 'BER',
        arrivalDate: new Date('2024-03-01'),
        arrivalTime: '13:20',
        availableWeight: 10.0,
        pricePerKg: 15.00,
        specialNotes: 'Short European flight. Perfect for documents, gifts, or small items.',
        status: 'ACTIVE'
      }
    })
  ])

  // Create sender posts
  const senderPosts = await Promise.all([
    prisma.senderPost.create({
      data: {
        userId: users[1].id,
        originCountry: 'Canada',
        originCity: 'Vancouver',
        originAddress: 'Downtown Vancouver, BC',
        destinationCountry: 'Iran',
        destinationCity: 'Isfahan',
        destinationAddress: 'City center area',
        itemCategory: 'Documents',
        itemDescription: 'Important legal documents and family photos',
        weight: 2.5,
        photos: [],
        specialNotes: 'Time-sensitive documents that need to reach my family. Will pay extra for careful handling.',
        pickupNotes: 'Can meet anywhere in Vancouver downtown',
        deliveryNotes: 'Recipient will pick up from traveler',
        maxPrice: 50.00,
        status: 'ACTIVE'
      }
    }),
    prisma.senderPost.create({
      data: {
        userId: users[3].id,
        originCountry: 'United States',
        originCity: 'Los Angeles',
        originAddress: 'Beverly Hills area',
        destinationCountry: 'France',
        destinationCity: 'Lyon',
        destinationAddress: 'City center',
        itemCategory: 'Electronics',
        itemDescription: 'iPhone 15 Pro (new, sealed) as gift for daughter',
        weight: 0.8,
        photos: [],
        specialNotes: 'Brand new iPhone for my daughter studying in France. Original packaging, insured.',
        pickupNotes: 'Can meet at LAX or Beverly Hills',
        deliveryNotes: 'Daughter can pick up from traveler in Lyon',
        maxPrice: 80.00,
        status: 'ACTIVE'
      }
    }),
    prisma.senderPost.create({
      data: {
        userId: users[1].id,
        originCountry: 'Canada',
        originCity: 'Montreal',
        originAddress: 'Old Montreal',
        destinationCountry: 'Iran',
        destinationCity: 'Tehran',
        destinationAddress: 'North Tehran',
        itemCategory: 'Gifts',
        itemDescription: 'Traditional Canadian maple syrup and souvenirs',
        weight: 4.2,
        photos: [],
        specialNotes: 'Authentic Canadian gifts for my Iranian friends. Maple syrup, postcards, and small souvenirs.',
        pickupNotes: 'Central Montreal pickup available',
        deliveryNotes: 'Recipients can meet traveler in Tehran',
        maxPrice: 35.00,
        status: 'ACTIVE'
      }
    }),
    prisma.senderPost.create({
      data: {
        userId: users[3].id,
        originCountry: 'United Kingdom',
        originCity: 'Manchester',
        destinationCountry: 'Germany',
        destinationCity: 'Munich',
        itemCategory: 'Clothing',
        itemDescription: 'Designer winter coat (Burberry) for sister',
        weight: 1.8,
        photos: [],
        specialNotes: 'Expensive designer coat as birthday gift. Needs careful handling, has original tags.',
        pickupNotes: 'Manchester city center',
        deliveryNotes: 'Sister will meet traveler in Munich',
        maxPrice: 60.00,
        status: 'ACTIVE'
      }
    })
  ])

  console.log('✅ Dummy data created successfully!')
  console.log(`Created ${users.length} users`)
  console.log(`Created ${travellerPosts.length} traveller posts`)
  console.log(`Created ${senderPosts.length} sender posts`)
  
  console.log('\n📧 Dummy user accounts (all password: password123):')
  users.forEach(user => {
    console.log(`- ${user.name} ${user.lastName}: ${user.email}`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })