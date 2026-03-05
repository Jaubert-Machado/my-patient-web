'use client'

import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { FaApple, FaGoogle } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)

  const isDisabled = !email || !password || isLoading

  useGSAP(
    () => {
      gsap.from(cardRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
      })
    },
    { scope: cardRef }
  )

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.message ?? 'Erro ao entrar. Tente novamente.')
        return
      }

      router.push('/')
    } catch {
      setError('Não foi possível conectar ao servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div
        ref={cardRef}
        className="bg-background/70 border-border/50 w-full max-w-sm space-y-6 rounded-3xl border p-8 shadow-md backdrop-blur-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px]">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="rounded-xl pr-10"
              />
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/*<div className="flex justify-end">*/}
          {/*  <Link*/}
          {/*    href="/forgot-password"*/}
          {/*    className="text-muted-foreground hover:text-foreground text-xs hover:underline"*/}
          {/*  >*/}
          {/*    Esqueceu sua senha?*/}
          {/*  </Link>*/}
          {/*</div>*/}

          <Button type="submit" className="w-full rounded-xl" disabled={isDisabled}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>

          {error && <p className="text-destructive text-sm">{error}</p>}
        </form>

        <div className="relative">
          <Separator />
          <span className="bg-background/70 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-xs">
            ou
          </span>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            type="button"
            className="h-11 w-11 rounded-full"
            aria-label="Continuar com Apple"
          >
            <FaApple className="size-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            type="button"
            className="h-11 w-11 rounded-full"
            aria-label="Continuar com Google"
          >
            <FaGoogle className="size-4" />
          </Button>
        </div>

        {/*<p className="text-muted-foreground text-center text-sm">*/}
        {/*  Não tem conta?{' '}*/}
        {/*  <Link href="/register" className="text-foreground font-medium hover:underline">*/}
        {/*    Criar conta*/}
        {/*  </Link>*/}
        {/*</p>*/}
      </div>
    </div>
  )
}
