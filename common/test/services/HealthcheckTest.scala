package services

import org.scalatest.{FlatSpec, Matchers}
import common.UsesElasticSearch
import test.EditionalisedHtmlUnit
import play.api.libs.ws.WS
import scala.concurrent.duration._
import scala.concurrent.Await

abstract class HealthcheckTest(warmupUrl: String) extends FlatSpec with Matchers with UsesElasticSearch {

  // you have to actually hit a url (in dev/ test mode) before the management plugin will start, hence warmup url
  "Healthchecks" should "pass" in HtmlWithManagement(warmupUrl){ browser =>
    Await.result(WS.url("http://localhost:18080/management/healthcheck").get(), 10.seconds).status should be (200)
  }
}

private object HtmlWithManagement extends EditionalisedHtmlUnit {
  override def disabledPlugins: Seq[String] = Seq(
    "conf.SwitchBoardPlugin"
  )
}