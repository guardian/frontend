package services

import org.scalatest.{Matchers, FlatSpec}
import play.api.libs.ws.WS
import test.HtmlUnit
import scala.concurrent.Await
import scala.concurrent.duration._

class AdminHealthCheckTest extends FlatSpec with Matchers {

  import play.api.Play.current

  "Healthchecks" should "pass" in HtmlUnit("/admin"){ browser =>

    Await.result(WS.url(s"http://localhost:${HtmlUnit.port}/_healthcheck").get(), 10.seconds).status should be (200)
  }
}