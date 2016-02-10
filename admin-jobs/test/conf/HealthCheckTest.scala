package conf

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.ws.WS
import test.ConfiguredTestSuite
import scala.concurrent.duration._
import scala.concurrent.Await

@DoNotDiscover class HealthCheckTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Healthchecks" should "pass" in goTo("/news-alert/alerts"){ _ =>
    Await.result(WS.url(s"http://localhost:${port}/_healthcheck").get(), 10.seconds).status should be (200)
  }
}
