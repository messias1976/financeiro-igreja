import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050A1B]">
      {/* Orbes de Luz de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[520px] px-4 py-8">
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl rounded-[2rem] overflow-hidden">
          {/* Linha de detalhe superior (Golden Gradient) */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-200 via-amber-500 to-blue-500" />
          
          <CardHeader className="pt-10 pb-4 text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-500 font-bold text-xl">fC</span>
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </CardTitle>
            <CardDescription className="mt-3 text-slate-400 text-balance">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-10 pt-4 px-8 sm:px-12">
            {children}
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-xs uppercase tracking-widest text-slate-500">
          Ambiente Seguro • Gestão Financeira Eclesiástica
        </p>
      </div>
    </div>
  )
}