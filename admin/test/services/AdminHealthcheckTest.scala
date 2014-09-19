package services

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.libs.ws.WS
import test.ConfiguredTestSuite
import scala.concurrent.Await
import scala.concurrent.duration._

@DoNotDiscover class AdminHealthCheckTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Healthchecks" should "pass" in goTo("/admin"){ browser =>

    Await.result(WS.url(withHost(s"/_healthcheck")).get(), 10.seconds).status should be (200)
  }
}