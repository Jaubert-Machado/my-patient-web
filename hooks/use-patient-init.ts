'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/contexts/session-context'

export function usePatientInit() {
  const { caseId, setPatientFicha, setCaseId } = useSession()

  const { isLoading } = useQuery({
    queryKey: ['patient-init'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents/patient/init`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      setPatientFicha(data.ficha)
      setCaseId(data.caseId)
      return data
    },
    enabled: !caseId,
    staleTime: Infinity,
    retry: false,
  })

  return { isLoading }
}
