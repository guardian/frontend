package services

import common.TestWsConfig
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.ws.WS
import test._

import scala.concurrent.Await
import scala.concurrent.duration._

@DoNotDiscover class OnwardHealthcheckTest extends FlatSpec with Matchers with ConfiguredTestSuite with TestWsConfig {

  "Healthchecks" should "pass" in goTo("/most-read.json"){ _ =>

    Await.result(WS.clientUrl(s"http://localhost:${port}/_healthcheck")(longTimeoutConfig).get(), 10.seconds).status should be (200)
  }

}
