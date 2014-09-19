package test

import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.ws.WS
import scala.concurrent.duration._
import scala.concurrent.Await

@DoNotDiscover class HealthCheckTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Healthchecks" should "pass" in goTo("/world/2014/feb/05/libya-says-chemical-weapons-destroyed"){ browser =>

    Await.result(WS.url(s"http://localhost:${port}/_healthcheck").get(), 10.seconds).status should be (200)
  }
}