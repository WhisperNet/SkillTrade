import { Listener, Subjects, PostDeletedEvent } from "@cse-350/shared-library"
import { Message } from "node-nats-streaming"
import { Connection } from "../../models/Connection"

export class PostDeletedListener extends Listener<PostDeletedEvent> {
  subject: Subjects.PostDeleted = Subjects.PostDeleted
  queueGroupName = "connection-service"

  async onMessage(data: PostDeletedEvent["data"], msg: Message) {
    const { postId } = data
    await Connection.deleteMany({ postId })
    msg.ack()
  }
}
