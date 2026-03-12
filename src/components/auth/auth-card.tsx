import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="pointer-events-none absolute right-[-8%] top-[8%] h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-8%] h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />

      <Card className="relative w-full max-w-md border border-white/15 bg-slate-950/75 text-white shadow-[0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <CardHeader className="pb-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-200/80">financialChurch</p>
          <CardTitle className="mt-3 text-2xl font-semibold text-white md:text-3xl">{title}</CardTitle>
          <CardDescription className="mt-2 text-sm leading-relaxed text-slate-300">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-6">{children}</CardContent>
      </Card>
    </div>
  )
}
