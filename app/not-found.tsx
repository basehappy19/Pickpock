import Link from "next/link";
import { Home, FileX } from "lucide-react";
import { Button } from "@/components/shared/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <div className="p-6 rounded-2xl bg-muted/50 border">
            <FileX className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
