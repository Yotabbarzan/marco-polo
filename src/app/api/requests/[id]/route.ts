import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { authOptions } from "@/auth"

const updateRequestSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
  agreedPrice: z.number().positive().optional(),
})

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const userId = (session.user as { id: string }).id

    const requestData = await prisma.request.findFirst({
      where: {
        id,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
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
      }
    })

    if (!requestData) {
      return NextResponse.json(
        { message: "Request not found or access denied" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      request: requestData
    })

  } catch (error) {
    console.error("Request fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedFields = updateRequestSchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.format() },
        { status: 400 }
      )
    }

    const { status, agreedPrice } = validatedFields.data
    const userId = (session.user as { id: string }).id

    // First, fetch the request to verify ownership and current status
    const existingRequest = await prisma.request.findFirst({
      where: {
        id,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { message: "Request not found or access denied" },
        { status: 404 }
      )
    }

    // Business logic for status updates
    if (status === 'ACCEPTED' || status === 'REJECTED') {
      // Only the receiver can accept or reject
      if (existingRequest.receiverId !== userId) {
        return NextResponse.json(
          { message: "Only the request receiver can accept or reject" },
          { status: 403 }
        )
      }
      
      // Can only accept/reject pending requests
      if (existingRequest.status !== 'PENDING') {
        return NextResponse.json(
          { message: "Can only accept or reject pending requests" },
          { status: 400 }
        )
      }
    }

    if (status === 'COMPLETED') {
      // Only accepted requests can be completed
      if (existingRequest.status !== 'ACCEPTED') {
        return NextResponse.json(
          { message: "Only accepted requests can be completed" },
          { status: 400 }
        )
      }
    }

    if (status === 'CANCELLED') {
      // Only the sender can cancel, and only pending/accepted requests
      if (existingRequest.senderId !== userId) {
        return NextResponse.json(
          { message: "Only the request sender can cancel" },
          { status: 403 }
        )
      }
      
      if (!['PENDING', 'ACCEPTED'].includes(existingRequest.status)) {
        return NextResponse.json(
          { message: "Can only cancel pending or accepted requests" },
          { status: 400 }
        )
      }
    }

    // Update the request
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: {
        status,
        ...(agreedPrice && { agreedPrice }),
        updatedAt: new Date(),
      },
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
      }
    })

    // Add a system message to the conversation about the status change
    if (updatedRequest.conversation) {
      let systemMessage = ""
      switch (status) {
        case 'ACCEPTED':
          systemMessage = `Request has been accepted${agreedPrice ? ` for $${agreedPrice}` : ''}`
          break
        case 'REJECTED':
          systemMessage = "Request has been rejected"
          break
        case 'COMPLETED':
          systemMessage = "Request has been completed"
          break
        case 'CANCELLED':
          systemMessage = "Request has been cancelled"
          break
      }

      await prisma.message.create({
        data: {
          conversationId: updatedRequest.conversation.id,
          senderId: userId,
          content: systemMessage,
          messageType: 'SYSTEM'
        }
      })
    }

    return NextResponse.json(
      { 
        message: "Request updated successfully!",
        request: updatedRequest
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Request update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}