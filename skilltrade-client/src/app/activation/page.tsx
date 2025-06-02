"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation"
import buildClient from "../../../api/client"

export default function ActivationPage() {
  const router = useRouter()

  const handleActivation = async () => {
    try {
      const client = buildClient({ req: null })
      await client.post("/api/users/signout")
      router.push("/users/signin")
    } catch (error) {
      console.error("Error during activation:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Thank You for Your Support!</CardTitle>
          <CardDescription className="text-center text-lg">
            Your premium purchase has been successful. We're excited to have you as a premium
            member!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            To activate your premium benefits and start enjoying all the enhanced features, please
            click the button below. You'll be signed out and redirected to the sign-in page. After
            signing back in, you'll have full access to all premium features.
          </p>
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-muted-foreground">Premium benefits include:</div>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              <li>Premium User Badge</li>
              <li>Highlighted Listings</li>
              <li>Unlimited Post Edits</li>
              <li>Dedicated Communication Service</li>
              <li>Extended Listing Duration (7 days)</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg" onClick={handleActivation} className="w-full max-w-md">
            Activate Your Premium Benefits
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
