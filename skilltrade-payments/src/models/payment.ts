import mongoose from "mongoose"

interface PaymentAttrs {
  userId: string
  stripeId: string
}

interface PaymentDoc extends mongoose.Document {
  userId: string
  stripeId: string
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): Promise<PaymentDoc>
}

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return Payment.create({
    userId: attrs.userId,
    stripeId: attrs.stripeId,
  })
}

export const Payment = mongoose.model<PaymentDoc, PaymentModel>("Payment", paymentSchema)
