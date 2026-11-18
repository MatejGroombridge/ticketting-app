import type { Metadata } from "next"
import { Logo } from "@/components/logo"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Sign in" }

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams
  const starting = sp.next === "start"
  return (
    <div className="grid flex-1 place-items-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-sm">
        <Logo className="justify-center" />
        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-xl font-semibold">{starting ? "Start selling tickets" : "Sign in to your dashboard"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll email you a sign-in link. No password needed.
          </p>
          <LoginForm next={starting ? "/dashboard?create=1" : "/dashboard"} />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Buying tickets? You don&apos;t need an account.
        </p>
      </div>
    </div>
  )
}
