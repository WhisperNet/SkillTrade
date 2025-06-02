"use client"

import { useState } from "react"
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import buildClient from "../../api/client"

export const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(undefined)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      // Get the client secret from backend
      const client = buildClient({ req: null })
      const { data } = await client.post("/api/payment/create-intent")

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        setErrorMessage(error.message)
        setIsProcessing(false)
        return
      }

      // Confirm payment with backend
      await client.post("/api/payment", {
        paymentIntentId: paymentIntent?.id,
      })

      // Redirect to activation page
      router.push("/activation")
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.")
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="p-4 border rounded-lg mb-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      {errorMessage && <div className="text-red-500 text-sm mt-2 mb-4">{errorMessage}</div>}
      <Button className="w-full" disabled={!stripe || isProcessing}>
        {isProcessing ? "Processing..." : "Upgrade to Premium - $10"}
      </Button>
    </form>
  )
}
