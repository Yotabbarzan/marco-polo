import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/auth"

const travellerPostSchema = z.object({
  departureCountry: z.string().min(1, "Departure country is required"),
  departureCity: z.string().optional(),
  departureAirport: z.string().optional(),
  departureDate: z.string().pipe(z.coerce.date()),
  departureTime: z.string().optional(),
  arrivalCountry: z.string().min(1, "Arrival country is required"),
  arrivalCity: z.string().optional(),
  arrivalAirport: z.string().optional(),
  arrivalDate: z.string().pipe(z.coerce.date()),
  arrivalTime: z.string().optional(),
  availableWeight: z.number().positive("Available weight must be greater than 0"),
  pricePerKg: z.number().positive("Price per kg must be greater than 0"),
  specialNotes: z.string().optional(),
  pickupLocation: z.string().optional(),
  deliveryLocation: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedFields = travellerPostSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.format() },
        { status: 400 }
      )
    }

    const {
      departureCountry,
      departureCity,
      departureAirport,
      departureDate,
      departureTime,
      arrivalCountry,
      arrivalCity,
      arrivalAirport,
      arrivalDate,
      arrivalTime,
      availableWeight,
      pricePerKg,
      specialNotes,
      pickupLocation,
      deliveryLocation,
    } = validatedFields.data

    // Validate that departure date is before arrival date
    if (departureDate >= arrivalDate) {
      return NextResponse.json(
        { message: "Departure date must be before arrival date" },
        { status: 400 }
      )
    }

    // Validate that dates are in the future
    if (departureDate < new Date()) {
      return NextResponse.json(
        { message: "Departure date must be in the future" },
        { status: 400 }
      )
    }

    // Create the traveller post
    const travellerPost = await prisma.travellerPost.create({
      data: {
        userId: (session.user as { id: string }).id,
        departureCountry,
        departureCity,
        departureAirport,
        departureDate,
        departureTime,
        arrivalCountry,
        arrivalCity,
        arrivalAirport,
        arrivalDate,
        arrivalTime,
        availableWeight,
        pricePerKg,
        specialNotes,
        pickupLocation,
        deliveryLocation,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            rating: true,
            totalTrips: true,
          }
        }
      }
    })

    return NextResponse.json(
      { 
        message: "Traveller post created successfully!",
        post: travellerPost
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Traveller post creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const departureCountry = searchParams.get('departureCountry')
    const arrivalCountry = searchParams.get('arrivalCountry')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const userId = searchParams.get('userId')
    const excludeUser = searchParams.get('excludeUser')

    const skip = (page - 1) * limit

    // Build filter conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      status: 'ACTIVE',
    }

    // Only filter by future dates if not filtering by userId (for user's own posts)
    if (!userId) {
      where.departureDate = {
        gte: new Date(), // Only show future trips
      }
    }

    if (userId) {
      where.userId = userId
    }

    if (excludeUser) {
      where.userId = {
        not: excludeUser
      }
    }

    if (departureCountry) {
      where.departureCountry = {
        contains: departureCountry,
        mode: 'insensitive'
      }
    }

    if (arrivalCountry) {
      where.arrivalCountry = {
        contains: arrivalCountry,
        mode: 'insensitive'
      }
    }

    if (dateFrom) {
      if (!where.departureDate) {
        where.departureDate = {}
      }
      where.departureDate.gte = new Date(dateFrom)
    }

    if (dateTo) {
      if (!where.departureDate) {
        where.departureDate = {}
      }
      where.departureDate.lte = new Date(dateTo)
    }

    const [posts, totalCount] = await Promise.all([
      prisma.travellerPost.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastName: true,
              rating: true,
              totalTrips: true,
              image: true,
            }
          },
          _count: {
            select: {
              requests: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.travellerPost.count({ where })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      }
    })

  } catch (error) {
    console.error("Traveller posts fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}