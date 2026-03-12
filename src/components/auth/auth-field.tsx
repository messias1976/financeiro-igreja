import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AuthFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>
  name: TName
  label: string
  placeholder: string
  type?: string
  inputClassName?: string
}

export function AuthField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  inputClassName,
}: AuthFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              className={cn(
                'h-11 rounded-xl border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 focus-visible:border-amber-200/90 focus-visible:ring-amber-200/35',
                inputClassName,
              )}
              type={type}
              placeholder={placeholder}
              {...field}
            />
          </FormControl>
          <FormMessage className="text-xs text-red-200" />
        </FormItem>
      )}
    />
  )
}
