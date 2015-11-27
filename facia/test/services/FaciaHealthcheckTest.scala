package services

import common.TestWsConfig
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.libs.ws.WS
import test._

import scala.concurrent.duration._
import scala.concurrent.Await

@DoNotDiscover class FaciaHealthcheckTest extends FlatSpec with Matchers with ConfiguredTestSuite with TestWsConfig {

  "Healthchecks" should "pass" in goTo("/uk"){ _ =>
    Await.result(WS.clientUrl(s"http://localhost:$port/_healthcheck")(longTimeoutConfig).get(), 10.seconds).status should be (200)
  }

  "Cdn Healthcheck" should "pass once fronts can be served" in goTo("/uk"){ _ =>
    //val wsConfig = new TestWsConfig{}
    //implicit val config = wsConfig.longTimeoutConfig
    Await.result(WS.clientUrl(s"http://localhost:$port/_fronts_cdn_healthcheck")(longTimeoutConfig).get(), 10.seconds).status should be (200)
  }
}
