package services

import common.TestWsConfig
import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.libs.ws.WS
import test.ConfiguredTestSuite
import scala.concurrent.duration._
import scala.concurrent.Await

@DoNotDiscover class DiagnosticsHealthcheckTest extends FlatSpec with Matchers with ConfiguredTestSuite with TestWsConfig {

  "Healthchecks" should "pass" in goTo("/ab.gif"){ _ =>

    Await.result(WS.clientUrl(s"http://localhost:${port}/_healthcheck").get(), 10.seconds).status should be (200)
  }
}
