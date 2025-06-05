import { Publisher, Subjects, ConnectionAcceptedEvent } from "@cse-350/shared-library"

export class ConnectionAcceptedPublisher extends Publisher<ConnectionAcceptedEvent> {
  subject: Subjects.ConnectionAccepted = Subjects.ConnectionAccepted
}
