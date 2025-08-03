import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    // Allow for initial setup - will remove this endpoint after use

    const hashedPassword = await bcrypt.hash('password123', 12)
    
    // Create dummy users
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'sarah.traveller@demo.com' },
        update: {},
        create: {
          email: 'sarah.traveller@demo.com',
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
        where: { email: 'mike.sender@demo.com' },
        update: {},
        create: {
          email: 'mike.sender@demo.com',
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
        where: { email: 'anna.globe@demo.com' },
        update: {},
        create: {
          email: 'anna.globe@demo.com',
          name: 'Anna',
          lastName: 'Rodriguez',
          password: hashedPassword,
          emailVerified: new Date(),
          rating: 4.9,
          totalTrips: 23,
          completedTrips: 22,
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
          userId: users[2].id,
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
    ])

    return NextResponse.json({
      message: "Dummy data created successfully!",
      users: users.length,
      travellerPosts: travellerPosts.length,
      senderPosts: senderPosts.length
    })

  } catch (error) {
    console.error("Dummy data creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}