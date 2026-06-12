import Link from "next/link";
import { Sparkles, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-in zoom-in-95 duration-700">
      <div className="relative">
        <div className="absolute -inset-10 bg-gradient-to-r from-primary/30 to-blue-600/30 blur-3xl opacity-50 rounded-full"></div>
        <div className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-foreground leading-none tracking-tighter drop-shadow-sm">
          404
        </div>
        <Sparkles className="absolute -top-4 -right-8 h-12 w-12 text-primary animate-pulse" />
      </div>
      
      <h2 className="mt-8 text-3xl font-extrabold tracking-tight">Oops! Page not found</h2>
      <p className="mt-4 text-lg text-muted-foreground max-w-[500px]">
        We couldn't find the page you're looking for. It might have been moved or doesn't exist in our AI database.
      </p>

      <Link 
        href="/" 
        className="mt-10 inline-flex items-center gap-2 h-14 px-8 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-1"
      >
        <Home className="h-5 w-5" /> Back to Dashboard
      </Link>
    </div>
  );
}
