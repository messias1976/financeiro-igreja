import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FieldValues, UseFormReturn } from 'react-hook-form'

interface AuthFormProps<T extends FieldValues> {
  onSubmit: (data: T) => void
  children: (form: UseFormReturn<T>) => React.ReactNode
  submitText: string
  loadingText: string
  isLoading?: boolean
  form: UseFormReturn<T>
}

export function AuthForm<T extends FieldValues>({ onSubmit, children, submitText, loadingText, isLoading, form }: AuthFormProps<T>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className={cn("space-y-4", isLoading && "opacity-50 pointer-events-none")}>
          {children(form)}
        </div>

        {form.formState.errors.root && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center animate-in slide-in-from-top-1">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E8CC7A] to-[#D9B858] text-[#050A1B] font-bold shadow-[0_10px_20px_rgba(232,204,122,0.15)] hover:shadow-[0_15px_30px_rgba(232,204,122,0.25)] hover:-translate-y-0.5 transition-all duration-300"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{loadingText}</span>
            </div>
          ) : (
            submitText
          )}
        </Button>
      </form>
    </Form>
  )
}