
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/react-query/query-client'

export function getContext() {
  // Sempre retorna o mesmo QueryClient singleton
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
