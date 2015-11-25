package services

import common.TestWsConfig
import org.scalatest.{Matchers, FlatSpec}
import play.api.libs.ws.WS
import test._

import scala.concurrent.duration._
import scala.concurrent.Await

class IdentityHealthcheckTest extends FlatSpec with Matchers with TestWsConfig {

  import play.api.Play.current

  "Healthchecks" should "pass" in HtmlUnit("/signin"){ _ =>

    Await.result(WS.clientUrl(s"http://localhost:${HtmlUnit.port}/_healthcheck").get(), 10.seconds).status should be (200)
  }
}
