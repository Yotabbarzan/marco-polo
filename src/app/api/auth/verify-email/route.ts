import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be 6 digits"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedFields = verifySchema.safeParse(body)

    if (!validatedFields.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validatedFields.error.format() },
        { status: 400 }
      )
    }

    const { email, code } = validatedFields.data

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code,
        expires: {
          gte: new Date(), // Token hasn't expired
        },
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 }
      )
    }

    // Update user's emailVerified status
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    })

    // Delete the used verification token
    await prisma.verificationToken.delete({
      where: {
        token: verificationToken.token,
      },
    })

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}