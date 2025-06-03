import { Listener, PaymentCreatedEvent, Subjects } from "@cse-350/shared-library"
import { Message } from "node-nats-streaming"
import { Post } from "../../models/Posts"

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
  queueGroupName: string = "skilltrade-community-service"
  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const result = await Post.updateMany({ authorId: data.userId }, { isPremium: true })
    console.log(`Updated ${result.modifiedCount} posts for user ${data.userId}`)
    msg.ack()
  }
}
