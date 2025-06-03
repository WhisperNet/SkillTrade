import { app } from "./app"
import mongoose from "mongoose"
import { natsWrapper } from "./nats-wrapper"
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener"
const startUp = async () => {
  try {
    if (!process.env.JWT_KEY) throw Error("JWT Environment variable not found")
    if (!process.env.MONGO_URI) throw Error("MONGO_URI Environment variable not found")
    if (!process.env.NATS_CLIENT_ID || !process.env.NATS_CLUSTER_ID || !process.env.NATS_URL)
      throw new Error("NATS environment varialble not found")
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Database connected")
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    )
    natsWrapper.client.on("close", () => {
      console.log("Nats cleint is shutting down\nReason:Cleint connection has been closed")
      process.exit()
    })
    process.on("SIGINT", () => natsWrapper.client.close())
    process.on("SIGTERM", () => natsWrapper.client.close())
    new PaymentCreatedListener(natsWrapper.client).listen()
    app.listen(3000, err => {
      console.log("Community Servise is listening on port 3000!")
    })
  } catch (err) {
    console.log("Something went wrong while starting the app")
    console.log(err)
  }
}

startUp()
