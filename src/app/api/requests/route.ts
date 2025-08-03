import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/auth"

const createRequestSchema = z.object({
  senderPostId: z.string().min(1, "Sender post ID is required"),
  travellerPostId: z.string().min(1, "Traveller post ID is required"),
  message: z.string().optional(),
  proposedPrice: z.number().positive().optional(),
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
    const validatedFields = createRequestSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.format() },
        { status: 400 }
      )
    }

    const { senderPostId, travellerPostId, message, proposedPrice } = validatedFields.data
    const userId = (session.user as { id: string }).id

    // Verify that the posts exist and are active
    const [senderPost, travellerPost] = await Promise.all([
      prisma.senderPost.findFirst({
        where: { id: senderPostId, status: 'ACTIVE' },
        include: { user: { select: { id: true } } }
      }),
      prisma.travellerPost.findFirst({
        where: { id: travellerPostId, status: 'ACTIVE' },
        include: { user: { select: { id: true } } }
      })
    ])

    if (!senderPost || !travellerPost) {
      return NextResponse.json(
        { message: "One or both posts not found or inactive" },
        { status: 404 }
      )
    }

    // Determine sender and receiver based on who is making the request
    let senderId: string, receiverId: string
    
    if (senderPost.user.id === userId) {
      // User owns the sender post, so they're requesting from a traveller
      senderId = userId
      receiverId = travellerPost.user.id
    } else if (travellerPost.user.id === userId) {
      // User owns the traveller post, so they're responding to a sender
      senderId = senderPost.user.id
      receiverId = userId
    } else {
      return NextResponse.json(
        { message: "You must own one of the posts to create a request" },
        { status: 403 }
      )
    }

    // Check if a request already exists between these posts
    const existingRequest = await prisma.request.findFirst({
      where: {
        senderPostId,
        travellerPostId,
        senderId,
        receiverId,
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { message: "A request already exists between these posts" },
        { status: 409 }
      )
    }

    // Create the request
    const newRequest = await prisma.request.create({
      data: {
        senderPostId,
        travellerPostId,
        senderId,
        receiverId,
        message,
        proposedPrice,
        status: 'PENDING',
      },
      include: {
        senderPost: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                rating: true,
                image: true,
              }
            }
          }
        },
        travellerPost: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                rating: true,
                image: true,
              }
            }
          }
        },
        sender: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            rating: true,
            image: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            rating: true,
            image: true,
          }
        }
      }
    })

    // Auto-create conversation for this request
    await prisma.conversation.create({
      data: {
        requestId: newRequest.id,
        participants: {
          create: [
            { userId: senderId },
            { userId: receiverId }
          ]
        }
      }
    })

    return NextResponse.json(
      { 
        message: "Request created successfully!",
        request: newRequest
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Request creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') // 'sent' or 'received' or 'all'
    const status = searchParams.get('status')

    const skip = (page - 1) * limit
    const userId = (session.user as { id: string }).id

    // Build filter conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {}

    // Filter by user relationship to requests
    if (type === 'sent') {
      where.senderId = userId
    } else if (type === 'received') {
      where.receiverId = userId
    } else {
      // Default to all requests where user is involved
      where.OR = [
        { senderId: userId },
        { receiverId: userId }
      ]
    }

    // Filter by status if provided
    if (status) {
      where.status = status
    }

    const [requests, totalCount] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          senderPost: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  lastName: true,
                  rating: true,
                  image: true,
                }
              }
            }
          },
          travellerPost: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  lastName: true,
                  rating: true,
                  image: true,
                }
              }
            }
          },
          sender: {
            select: {
              id: true,
              name: true,
              lastName: true,
              rating: true,
              image: true,
            }
          },
          receiver: {
            select: {
              id: true,
              name: true,
              lastName: true,
              rating: true,
              image: true,
            }
          },
          conversation: {
            select: {
              id: true,
              updatedAt: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.request.count({ where })
    ])

    return NextResponse.json({
      requests,
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
    console.error("Requests fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}