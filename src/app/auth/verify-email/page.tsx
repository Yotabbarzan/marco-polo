"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function VerifyEmailContent() {
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(""))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode]
      newCode[index] = value
      setVerificationCode(newCode)

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const code = verificationCode.join("")
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      })

      if (response.ok) {
        router.push("/auth/login?message=Email verified successfully")
      } else {
        const data = await response.json()
        setError(data.message || "Invalid verification code")
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setError("")
        // Show success message or toast
      } else {
        setError("Failed to resend code")
      }
    } catch {
      setError("Failed to resend code")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center justify-center mb-4">
            <Image
              src="/marcopolo-360-logo.png"
              alt="Marcopolo 360 Logo"
              width={140}
              height={140}
              className="mb-2"
            />
          </div>
          <CardTitle className="text-xl">Enter The Code Sent to Your Email</CardTitle>
          <CardDescription>
            We sent a 6-digit verification code to {email}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-center space-x-2">
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-bold"
                  required
                />
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-700 hover:bg-slate-800"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Create"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-slate-600 hover:text-slate-800 hover:underline font-medium"
                >
                  Resend
                </button>
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a
                  href="/auth/login"
                  className="text-slate-600 hover:text-slate-800 hover:underline font-medium"
                >
                  Login here
                </a>
              </p>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}