"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "@/components/language-selector"
import { BarChart3, Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (isLogin) {
        const result = await signIn("credentials", { email, password, redirect: false })
        if (result?.error) {
          setError(t.auth.invalidCredentials)
        } else {
          router.push("/dashboard")
          router.refresh()
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || t.auth.registrationFailed)
        } else {
          const result = await signIn("credentials", { email, password, redirect: false })
          if (result?.ok) {
            router.push("/dashboard")
            router.refresh()
          } else {
            setError(t.auth.invalidCredentials)
          }
        }
      }
    } catch {
      setError(t.common.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary flex-col items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full bg-white/5" />
          <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-white/[0.03]" />
        </div>
        <div className="relative z-10 text-center max-w-xs">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Analytics</h1>
          <p className="text-white/70 text-base mb-10 leading-relaxed">
            {isLogin ? t.auth.signInToAccount : t.auth.createAccount}
          </p>
          <div className="space-y-3 text-left">
            {[t.dashboard.totalProducts, t.dashboard.sevenDayPriceTrends, t.sources.title].map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/75 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-white/50 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="font-bold gradient-text">Analytics</span>
          </div>
          <div className="lg:ml-auto">
            <LanguageSelector />
          </div>
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">
              {isLogin ? t.auth.signIn : t.auth.signUp}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {isLogin ? t.auth.signInToAccount : t.auth.createAccount}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 mb-5 px-4 py-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  {t.auth.nameOptional}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.auth.name}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                {t.auth.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-border rounded-xl bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label="Toggle password"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? t.common.loading : isLogin ? t.auth.signIn : t.auth.signUp}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? t.auth.dontHaveAccount : t.auth.alreadyHaveAccount}{" "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null) }}
              className="font-medium text-primary hover:underline"
            >
              {isLogin ? t.auth.signUp : t.auth.signIn}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
