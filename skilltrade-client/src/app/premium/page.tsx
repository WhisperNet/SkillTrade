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
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { CheckoutForm } from "@/components/checkout-form"

const features = [
  {
    name: "Community Board Access",
    free: true,
    premium: true,
  },
  {
    name: "Create Listings",
    free: true,
    premium: true,
  },
  {
    name: "Profile Customization",
    free: true,
    premium: true,
  },
  {
    name: "Achievement Badges",
    free: true,
    premium: true,
  },
  {
    name: "Listing Duration",
    free: "24 hours",
    premium: "7 days",
  },
  {
    name: "Premium User Badge",
    free: false,
    premium: true,
  },
  {
    name: "Highlighted Listings",
    free: false,
    premium: true,
  },
  {
    name: "Post Edit Options",
    free: false,
    premium: "Unlimited",
  },
  {
    name: "Communication Service",
    free: "Standard",
    premium: "Dedicated",
  },
]

const premiumFeatures = features.filter(feature => feature.premium)

const stripePromise = loadStripe(
  "pk_test_51RSZPALzm8wwEfGLnviyM3T9gmu5F94ONZwmgWz8TERaGkj6svJVpigtMJxb93jaUORFKJITGkuIQCely0SdBR2O00Kx8lpGQw"
)

export default function PremiumPage() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const response = await fetch("/api/users/currentuser")
        const data = await response.json()
        setIsPremium(data.currentUser?.isPremium || false)
      } catch (error) {
        console.error("Error checking premium status:", error)
        setIsPremium(false)
      }
    }

    checkPremiumStatus()
  }, [])

  if (isPremium === null) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Thank You for Your Support!</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            You're enjoying all the premium benefits of SkillTrade. Here's what you have access to:
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Your Premium Benefits</CardTitle>
            <CardDescription>
              All the features you have access to as a premium member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-base">
                    {feature.name}
                    {typeof feature.premium === "string" && `: ${feature.premium}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/community")}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Unlock premium features to enhance your SkillTrade experience and stand out in our
          community.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground"> / lifetime</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check
                    className={cn("h-4 w-4", feature.free ? "text-green-500" : "text-gray-300")}
                  />
                  <span className={cn("text-sm", !feature.free && "text-muted-foreground")}>
                    {feature.name}
                    {typeof feature.free === "string" && `: ${feature.free}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="flex flex-col border-primary">
          <CardHeader>
            <CardTitle>Premium Plan</CardTitle>
            <CardDescription>Enhanced features for power users</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">$10</span>
              <span className="text-muted-foreground"> / lifetime</span>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check
                    className={cn("h-4 w-4", feature.premium ? "text-green-500" : "text-gray-300")}
                  />
                  <span className={cn("text-sm", !feature.premium && "text-muted-foreground")}>
                    {feature.name}
                    {typeof feature.premium === "string" && `: ${feature.premium}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include our core features. Premium features enhance your experience and
          visibility in the community.
        </p>
      </div>
    </div>
  )
}
