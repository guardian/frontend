package services

import common.TestWsConfig
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.libs.ws.WS
import test.ConfiguredTestSuite
import scala.concurrent.duration._
import scala.concurrent.Await

@DoNotDiscover class CommercialHealthcheckTest extends FlatSpec with Matchers with ConfiguredTestSuite with TestWsConfig {

  "Healthchecks" should "pass" in goTo("/"){ browser =>

    Await.result(WS.clientUrl(s"http://localhost:${port}/_healthcheck")(longTimeoutConfig).get(), 10.seconds).status should be (200)
  }
}
