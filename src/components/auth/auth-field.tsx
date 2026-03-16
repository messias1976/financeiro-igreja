import * as React from 'react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'

interface AuthFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  placeholder: string
  type?: string
}

export function AuthField<T extends FieldValues>({ control, name, label, placeholder, type = 'text' }: AuthFieldProps<T>) {
  const [show, setShow] = React.useState(false)
  const isPassword = type === 'password'

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">
            {label}
          </FormLabel>
          <div className="relative group">
            <FormControl>
              <Input
                {...field}
                type={isPassword ? (show ? 'text' : 'password') : type}
                placeholder={placeholder}
                className="h-12 rounded-xl border-white/5 bg-white/[0.03] px-4 text-white transition-all focus:border-amber-500/40 focus:ring-4 focus:ring-amber-500/10 focus:bg-white/[0.07]"
              />
            </FormControl>
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors p-1"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
          <FormMessage className="text-[11px] text-red-400 font-medium" />
        </FormItem>
      )}
    />
  )
}