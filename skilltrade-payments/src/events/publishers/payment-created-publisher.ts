import { PaymentCreatedEvent, Publisher, Subjects } from "@cse-350/shared-library"

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated
}
