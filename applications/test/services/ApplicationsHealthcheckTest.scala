package services

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.libs.ws.WS
import test.ConfiguredTestSuite
import scala.concurrent.Await
import scala.concurrent.duration._

@DoNotDiscover class ApplicationsHealthcheckTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Healthchecks" should "fail when sections are not laoded" in goTo("/world/iraq"){ browser =>
    Await.result(WS.url(s"http://localhost:$port/_healthcheck").get(), 10.seconds).body should be ("Sections have not loaded from Content API")
  }
}
