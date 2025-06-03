import { Publisher, Subjects } from "@cse-350/shared-library"
import { PostDeletedEvent } from "@cse-350/shared-library"

export class PostDeletedPublisher extends Publisher<PostDeletedEvent> {
  subject: Subjects.PostDeleted = Subjects.PostDeleted
}
