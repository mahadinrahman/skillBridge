import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="section-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="text-8xl font-bold text-primary/20">404</div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Page Not Found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <Button className="mt-8" asChild>
        <Link href="/">
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
