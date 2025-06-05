import { Listener, Subjects, ConnectionRejectedEvent } from "@cse-350/shared-library"
import { Message } from "node-nats-streaming"
import { Post } from "../../models/Posts"

export class ConnectionRejectedListener extends Listener<ConnectionRejectedEvent> {
  subject: Subjects.ConnectionRejected = Subjects.ConnectionRejected
  queueGroupName = "community-service"

  async onMessage(data: ConnectionRejectedEvent["data"], msg: Message) {
    const { postId, postAuthorId, requestedUserId } = data
    const post = await Post.findById(postId)
    if (!post) {
      return msg.ack()
    }
    if (post.connections?.includes(requestedUserId)) {
      post.connections = post.connections?.filter(id => id !== requestedUserId)
    }
    await post.save()
    msg.ack()
  }
}
