"use client"

import { SessionProvider } from "next-auth/react"

interface Props {
  children: React.ReactNode
  session?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function NextAuthProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}