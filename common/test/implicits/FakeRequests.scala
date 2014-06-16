package implicits

import play.api.test.FakeRequest

trait FakeRequests {
  implicit class FakeRequest2WithHost[A](req: FakeRequest[A]) {
    def withHost(host: String): FakeRequest[A] = req.withHeaders("Host" -> host)
  }
}
