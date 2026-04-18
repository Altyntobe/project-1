"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { LanguageSelector } from "@/components/language-selector"
import { BarChart3, Package, Database, ShieldCheck, LogOut, User } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { t } = useLanguage()

  const navItems = [
    { href: "/dashboard", label: t.common.dashboard, icon: BarChart3 },
    { href: "/products",  label: t.common.products,  icon: Package },
    { href: "/sources",   label: t.common.sources,   icon: Database },
    { href: "/admin",     label: t.common.admin,     icon: ShieldCheck },
  ]

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }

  const initials = session?.user?.name
    ? session.user.name.slice(0, 2).toUpperCase()
    : session?.user?.email?.slice(0, 2).toUpperCase() ?? "??"

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="text-base font-bold gradient-text hidden sm:block">
              Analytics
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden md:block">{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSelector />

            {session && (
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold ring-2 ring-primary/20">
                  {initials}
                </div>

                {/* Email hidden on small screens */}
                <span className="hidden lg:block text-xs text-muted-foreground max-w-[120px] truncate">
                  {session.user?.email}
                </span>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title={t.common.signOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:block">{t.common.signOut}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}
