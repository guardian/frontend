package services

import org.scalatest.{Matchers, FlatSpec}
import play.api.libs.ws.WS
import test.HtmlUnit
import scala.concurrent.Await
import scala.concurrent.duration._

class ApplicationsHealthcheckTest extends FlatSpec with Matchers {

  import play.api.Play.current

  "Healthchecks" should "pass" in HtmlUnit("/world/iraq"){ browser =>

    Await.result(WS.url(s"http://localhost:${HtmlUnit.port}/_healthcheck").get(), 10.seconds).status should be (200)
  }
}
