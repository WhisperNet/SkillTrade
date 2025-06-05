import { Listener, Subjects, ConnectionCancelledEvent } from "@cse-350/shared-library"
import { Message } from "node-nats-streaming"
import { Connection } from "../../models/Connection"

export class ConnectionCancelledListener extends Listener<ConnectionCancelledEvent> {
  subject: Subjects.ConnectionCancelled = Subjects.ConnectionCancelled
  queueGroupName = "connection-service"

  async onMessage(data: ConnectionCancelledEvent["data"], msg: Message) {
    const { postId, postAuthorId, requestedUserId } = data

    const connection = await Connection.findOneAndDelete({
      postId,
      postAuthorId,
      requestedUserId,
    })

    if (!connection) {
      return msg.ack()
    }

    msg.ack()
  }
}
