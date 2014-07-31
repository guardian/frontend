package test

import org.scalatest.{FlatSpec, Matchers}
import play.api.libs.ws.WS
import scala.concurrent.duration._
import scala.concurrent.Await

class HealthCheckTest extends FlatSpec with Matchers {

  import play.api.Play.current

  "Healthchecks" should "pass" in HtmlUnit("/world/2014/feb/05/libya-says-chemical-weapons-destroyed"){ browser =>

    Await.result(WS.url(s"http://localhost:${HtmlUnit.port}/_healthcheck").get(), 10.seconds).status should be (200)
  }
}