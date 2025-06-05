import { Listener, Subjects, ConnectionAcceptedEvent } from "@cse-350/shared-library"
import { Message } from "node-nats-streaming"
import { Post } from "../../models/Posts"

export class ConnectionAcceptedListener extends Listener<ConnectionAcceptedEvent> {
  subject: Subjects.ConnectionAccepted = Subjects.ConnectionAccepted
  queueGroupName = "community-service"

  async onMessage(data: ConnectionAcceptedEvent["data"], msg: Message) {
    const { postId, postAuthorId, requestedUserId } = data
    const post = await Post.findById(postId)
    if (!post) {
      return msg.ack()
    }
    if (post.connections?.includes(requestedUserId)) {
      post.connections = post.connections?.filter(id => id !== requestedUserId)
    }
    post.connectionAccepted?.push(requestedUserId)
    await post.save()
    msg.ack()
  }
}
