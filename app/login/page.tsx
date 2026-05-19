import { LoginForm } from "@/components/LoginForm";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Music } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-primary/40 via-secondary/30 to-accent/35" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-secondary/30 blur-3xl animate-pulse [animation-duration:4s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 flex flex-col items-center gap-8 animate-fade-in-up">
        <header className="text-center max-w-xl space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center rounded-full bg-base-100/80 p-4 shadow-lg animate-scale-in">
            <Music className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Concert Cost Tracker
          </h1>
          <p className="text-lg text-base-content/80">
            Remember every show, what you spent, and how much fun you had — all
            in one place.
          </p>
          <div className="flex justify-center">
            <ThemeSelector />
          </div>
        </header>

        <div className="w-full max-w-md animate-scale-in [animation-delay:150ms]">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
