import { natsWrapper } from "../../nats-wrapper"
import { Subjects, ReviewCreatedEvent, Publisher } from "@cse-350/shared-library"

export class ReviewCreatedPublisher extends Publisher<ReviewCreatedEvent> {
  readonly subject = Subjects.ReviewCreated
}
