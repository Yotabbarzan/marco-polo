import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

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

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        request: {
          include: {
            senderPost: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    lastName: true,
                    image: true,
                    rating: true,
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
                    image: true,
                    rating: true,
                  }
                }
              }
            },
            sender: {
              select: {
                id: true,
                name: true,
                lastName: true,
                image: true,
                rating: true,
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                lastName: true,
                image: true,
                rating: true,
              }
            }
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                lastName: true,
                image: true,
                rating: true,
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

    // Get the other participant
    const otherParticipant = conversation.participants.find(p => p.userId !== userId)

    return NextResponse.json({
      conversation: {
        ...conversation,
        otherParticipant: otherParticipant?.user || null,
      }
    })

  } catch (error) {
    console.error("Conversation fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}