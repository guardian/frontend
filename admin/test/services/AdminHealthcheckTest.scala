package services

import common.TestWsConfig
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.libs.ws.WS
import test.ConfiguredTestSuite
import scala.concurrent.Await
import scala.concurrent.duration._

@DoNotDiscover class AdminHealthCheckTest extends FlatSpec with Matchers with ConfiguredTestSuite with TestWsConfig {

  "Healthchecks" should "pass" in goTo("/admin"){ browser =>

    Await.result(WS.clientUrl(withHost(s"/_healthcheck")).get(), 10.seconds).status should be (200)
  }
}
