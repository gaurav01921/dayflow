import { ShieldAlert } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SignUpForm() {
  return (
    <Card className="border-border/60 shadow-xl shadow-black/10 backdrop-blur-sm sm:max-w-[480px] w-full mx-auto text-center">
      <CardHeader className="pb-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
          <ShieldAlert className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Public Sign-Up Disabled</CardTitle>
        <CardDescription className="text-sm">
          Employee registration is managed centrally by HR / Admin.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-800 dark:text-amber-300 leading-relaxed text-left space-y-2">
          <p className="font-semibold text-sm">How Employee Accounts Work:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Your HR / Admin creates your employee account in the system.</li>
            <li>You receive a system-generated <strong>Login ID</strong> and <strong>Temporary Password</strong>.</li>
            <li>Use those credentials on the Sign In page to log in for the first time.</li>
            <li>You will be prompted to set a new password on your first login.</li>
          </ol>
        </div>

        <Button asChild className="w-full h-10 font-semibold tracking-wide shadow-md shadow-primary/20">
          <Link to="/login">Go to Sign In Page</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
