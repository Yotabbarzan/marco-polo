import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

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
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit
    const userId = (session.user as { id: string }).id

    const [conversations, totalCount] = await Promise.all([
      prisma.conversation.findMany({
        where: {
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
                select: {
                  id: true,
                  itemDescription: true,
                  originCountry: true,
                  originCity: true,
                  destinationCountry: true,
                  destinationCity: true,
                  weight: true,
                }
              },
              travellerPost: {
                select: {
                  id: true,
                  departureCountry: true,
                  departureCity: true,
                  arrivalCountry: true,
                  arrivalCity: true,
                  departureDate: true,
                  availableWeight: true,
                }
              },
              sender: {
                select: {
                  id: true,
                  name: true,
                  lastName: true,
                  image: true,
                }
              },
              receiver: {
                select: {
                  id: true,
                  name: true,
                  lastName: true,
                  image: true,
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
                }
              }
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1, // Get the latest message
            select: {
              id: true,
              content: true,
              messageType: true,
              createdAt: true,
              senderId: true,
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.conversation.count({
        where: {
          participants: {
            some: {
              userId: userId
            }
          }
        }
      })
    ])

    // Transform conversations to include other participant info
    const transformedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p.userId !== userId)
      const latestMessage = conv.messages[0] || null
      
      return {
        ...conv,
        otherParticipant: otherParticipant?.user || null,
        latestMessage,
        unreadCount: 0, // TODO: Implement unread message tracking
      }
    })

    return NextResponse.json({
      conversations: transformedConversations,
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
    console.error("Conversations fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}