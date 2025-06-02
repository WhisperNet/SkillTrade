import request from "supertest"
import mongoose from "mongoose"
import { app } from "../../app"
import { stripe } from "../../stripe"
import { Payment } from "../../models/payment"
import { natsWrapper } from "../../nats-wrapper"

// const startUp = async () => {
//   const orderId = new mongoose.Types.ObjectId().toHexString()
//   const userId = new mongoose.Types.ObjectId().toHexString()
//   const order = await Order.build({
//     id: orderId,
//     version: 0,
//     price: Math.floor(Math.random() * 1000) + 1,
//     userId,
//     status: OrderStatus.Created,
//   })
//   return { orderId, userId, order }
// }

it("returns 401 for unauthenticated access", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const payment = await Payment.build({
    userId,
    stripeId: "tok_visa",
  })
  await request(app)
    .post("/api/payment")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
    })
    .expect(400)
})

it("returns 201 for valid inputs", async () => {
  await request(app)
    .post("/api/payment")
    .set("Cookie", global.signin())
    .send({
      token: "tok_visa",
    })
    .expect(201)
}, 10000)

it("charges the card and creats a payment", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .post("/api/payment")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
    })
    .expect(201)

  const charges = await stripe.charges.list({ limit: 5 })
  expect(charges).toBeDefined()

  const foundPayment = await Payment.findOne({
    userId,
  })
  expect(foundPayment).not.toBeNull()
}, 10000)

it("publishes an event", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .post("/api/payment")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
    })
    .expect(201)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
}, 10000)
