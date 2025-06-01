import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 px-4 text-center">
        <div className="relative w-[400px] h-[300px]">
          <Image src="/404.svg" alt="404 illustration" fill className="object-contain" priority />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
        </div>

        <p className="text-muted-foreground max-w-[500px]">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on
          track.
        </p>

        <Button asChild className="mt-4">
          <Link href="/" className="bg-primary hover:bg-primary/90">
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
