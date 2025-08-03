import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/auth"

const senderPostSchema = z.object({
  originCountry: z.string().min(1, "Origin country is required"),
  originCity: z.string().min(1, "Origin city is required"),
  originAddress: z.string().optional(),
  destinationCountry: z.string().min(1, "Destination country is required"),
  destinationCity: z.string().min(1, "Destination city is required"),
  destinationAddress: z.string().optional(),
  itemCategory: z.string().min(1, "Item category is required"),
  itemDescription: z.string().min(1, "Item description is required"),
  weight: z.number().positive("Weight must be greater than 0"),
  specialNotes: z.string().optional(),
  pickupNotes: z.string().optional(),
  deliveryNotes: z.string().optional(),
  maxPrice: z.number().positive().optional(),
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
    const validatedFields = senderPostSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.format() },
        { status: 400 }
      )
    }

    const {
      originCountry,
      originCity,
      originAddress,
      destinationCountry,
      destinationCity,
      destinationAddress,
      itemCategory,
      itemDescription,
      weight,
      specialNotes,
      pickupNotes,
      deliveryNotes,
      maxPrice,
    } = validatedFields.data

    // Create the sender post
    const senderPost = await prisma.senderPost.create({
      data: {
        userId: (session.user as { id: string }).id,
        originCountry,
        originCity,
        originAddress,
        destinationCountry,
        destinationCity,
        destinationAddress,
        itemCategory,
        itemDescription,
        weight,
        photos: [], // Start with empty array, will be updated with image upload feature
        specialNotes,
        pickupNotes,
        deliveryNotes,
        maxPrice,
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
        message: "Sender post created successfully!",
        post: senderPost
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Sender post creation error:", error)
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
    const originCountry = searchParams.get('originCountry')
    const destinationCountry = searchParams.get('destinationCountry')
    const itemCategory = searchParams.get('itemCategory')
    const minWeight = searchParams.get('minWeight')
    const maxWeight = searchParams.get('maxWeight')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const userId = searchParams.get('userId')

    const skip = (page - 1) * limit

    // Build filter conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      status: 'ACTIVE',
    }

    if (userId) {
      where.userId = userId
    }

    if (originCountry) {
      where.originCountry = {
        contains: originCountry,
        mode: 'insensitive'
      }
    }

    if (destinationCountry) {
      where.destinationCountry = {
        contains: destinationCountry,
        mode: 'insensitive'
      }
    }

    if (itemCategory) {
      where.itemCategory = {
        contains: itemCategory,
        mode: 'insensitive'
      }
    }

    if (minWeight || maxWeight) {
      where.weight = {}
      if (minWeight) {
        where.weight.gte = parseFloat(minWeight)
      }
      if (maxWeight) {
        where.weight.lte = parseFloat(maxWeight)
      }
    }

    if (minPrice || maxPrice) {
      where.maxPrice = {}
      if (minPrice) {
        where.maxPrice.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.maxPrice.lte = parseFloat(maxPrice)
      }
    }

    const [posts, totalCount] = await Promise.all([
      prisma.senderPost.findMany({
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
      prisma.senderPost.count({ where })
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
    console.error("Sender posts fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}