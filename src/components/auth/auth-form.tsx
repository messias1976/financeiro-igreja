import * as React from 'react'
import { UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AuthFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T, form: UseFormReturn<T>) => void
  children: (form: UseFormReturn<T>) => React.ReactNode
  submitText: string
  loadingText: string
  isLoading?: boolean
  className?: string
  submitClassName?: string
  form: UseFormReturn<T>
}

export function AuthForm<T extends FieldValues>({
  onSubmit,
  children,
  submitText,
  loadingText,
  isLoading = false,
  className = 'space-y-5',
  submitClassName,
  form,
}: AuthFormProps<T>) {
  const handleSubmit = (data: T) => {
    onSubmit(data, form)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        {children(form)}

        {form.formState.errors.root && (
          <div className="rounded-xl border border-red-300/35 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className={cn(
            'mt-1 h-11 w-full rounded-xl bg-linear-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 shadow-[0_14px_30px_rgba(234,179,8,0.35)] transition hover:brightness-110 hover:shadow-[0_18px_36px_rgba(234,179,8,0.45)]',
            submitClassName,
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {loadingText}
            </div>
          ) : (
            submitText
          )}
        </Button>
      </form>
    </Form>
  )
}
