import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/auth"

const createMessageSchema = z.object({
  conversationId: z.string().min(1, "Conversation ID is required"),
  content: z.string().min(1, "Message content is required"),
  messageType: z.enum(['TEXT', 'SYSTEM', 'STATUS_UPDATE']).default('TEXT'),
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
    const validatedFields = createMessageSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.format() },
        { status: 400 }
      )
    }

    const { conversationId, content, messageType } = validatedFields.data
    const userId = (session.user as { id: string }).id

    // Verify user is participant in the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                lastName: true,
              }
            }
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found or access denied" },
        { status: 404 }
      )
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        messageType,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            lastName: true,
            image: true,
          }
        }
      }
    })

    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(
      { 
        message: "Message sent successfully!",
        data: message
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Message creation error:", error)
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
    const conversationId = searchParams.get('conversationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!conversationId) {
      return NextResponse.json(
        { message: "Conversation ID is required" },
        { status: 400 }
      )
    }

    const skip = (page - 1) * limit
    const userId = (session.user as { id: string }).id

    // Verify user is participant in the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: userId
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversation not found or access denied" },
        { status: 404 }
      )
    }

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: {
          conversationId: conversationId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              lastName: true,
              image: true,
            }
          }
        },
        orderBy: {
          createdAt: 'asc'  // Messages in chronological order
        },
        skip,
        take: limit,
      }),
      prisma.message.count({ 
        where: { conversationId: conversationId } 
      })
    ])

    return NextResponse.json({
      messages,
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
    console.error("Messages fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}