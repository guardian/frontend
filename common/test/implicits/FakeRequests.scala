package implicits

import common.Edition
import play.api.mvc.Cookie
import play.api.test.FakeRequest

trait FakeRequests {
  implicit class FakeRequest2WithHost[A](req: FakeRequest[A]) {
    def withHost(host: String): FakeRequest[A] = req.withHeaders("Host" -> host)

    def from(edition: Edition): FakeRequest[A] = req.withCookies(Cookie("GU_EDITION", edition.id))
    def from(edition: String): FakeRequest[A] = req.withCookies(Cookie("GU_EDITION", edition))
  }
}
