import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button asChild>
        <Link href="/chat">Iniciar consulta</Link>
      </Button>
    </main>
  )
}
