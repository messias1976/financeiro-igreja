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
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/5 backdrop-blur-md">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white drop-shadow-sm">{title}</CardTitle>
          <CardDescription className="text-base text-slate-600 dark:text-slate-300 mt-1 mb-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-6">{children}</CardContent>
      </Card>
    </div>
  )
}
