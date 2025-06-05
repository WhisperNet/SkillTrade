import { Listener, Subjects, ConnectionRequestedEvent } from "@cse-350/shared-library"
import { Message } from "node-nats-streaming"
import { Connection } from "../../models/Connection"

export class ConnectionRequestedListener extends Listener<ConnectionRequestedEvent> {
  subject: Subjects.ConnectionRequested = Subjects.ConnectionRequested
  queueGroupName = "connection-service"

  async onMessage(data: ConnectionRequestedEvent["data"], msg: Message) {
    const {
      postId,
      postTitle,
      postAuthorId,
      requestedUserId,
      requestedUserName,
      requestedUserProfilePicture,
      toTeach,
      toLearn,
    } = data

    await Connection.build({
      postId,
      postTitle,
      postAuthorId,
      requestedUserId,
      requestedUserName,
      requestedUserProfilePicture,
      toTeach,
      toLearn,
    })
    msg.ack()
  }
}
