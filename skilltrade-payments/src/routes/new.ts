import {
  BadRequestError,
  NotAuthorizeError,
  NotFoundError,
  setCurrentUser,
  requestValidationHandler,
  requireAuth,
} from "@cse-350/shared-library"
import express, { Request, Response } from "express"
import { body } from "express-validator"
import { stripe } from "../stripe"
import { Payment } from "../models/payment"
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher"
import { natsWrapper } from "../nats-wrapper"

const router = express.Router()
const PRICE_IN_USD = 10

// Create payment intent
router.post(
  "/api/payment/create-intent",
  setCurrentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const userId = req.currentUser!.id

    // Check if payment already exists
    const foundPayment = await Payment.findOne({ userId })
    if (foundPayment) {
      throw new BadRequestError("A payment already exists for this user")
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRICE_IN_USD * 100,
      currency: "usd",
      metadata: {
        userId,
      },
    })

    res.status(200).send({ clientSecret: paymentIntent.client_secret })
  }
)

// Confirm payment
router.post(
  "/api/payment",
  setCurrentUser,
  requireAuth,
  [body("paymentIntentId").not().isEmpty().withMessage("Invalid Payment Intent ID")],
  requestValidationHandler,
  async (req: Request, res: Response) => {
    const { paymentIntentId } = req.body
    const userId = req.currentUser!.id

    const foundPayment = await Payment.findOne({ userId })
    if (foundPayment) {
      throw new BadRequestError("A payment already exists for this user")
    }

    // Retrieve the payment intent to verify it's completed
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      throw new BadRequestError("Payment not completed")
    }

    if (paymentIntent.metadata.userId !== userId) {
      throw new NotAuthorizeError()
    }

    const payment = await Payment.build({
      userId,
      stripeId: paymentIntent.id,
    })

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      userId: payment.userId,
      stripeId: payment.stripeId,
    })

    res.status(201).send(payment)
  }
)

export { router as newPaymentRouter }
