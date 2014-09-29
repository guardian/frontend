package services

import org.scalatest.{DoNotDiscover, Matchers, FlatSpec}
import play.api.libs.ws.WS
import test._

import scala.concurrent.duration._
import scala.concurrent.Await

@DoNotDiscover class OnwardHealthcheckTest extends FlatSpec with Matchers with ConfiguredTestSuite {

  "Healthchecks" should "pass" in goTo("/most-read.json"){ _ =>

    Await.result(WS.url(s"http://localhost:${port}/_healthcheck").get(), 10.seconds).status should be (200)
  }
}
