import { Listener, PaymentCreatedEvent, Subjects } from "@cse-350/shared-library"
import { Message } from "node-nats-streaming"
import { User } from "../../models/User"

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
  queueGroupName: string = "skilltrade-auth-service"
  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const updatedUser = await User.findByIdAndUpdate(
      data.userId,
      {
        isPremium: true,
      },
      { new: true }
    )
    if (!updatedUser) throw new Error("Unable to find the user to update")
    msg.ack()
  }
}
