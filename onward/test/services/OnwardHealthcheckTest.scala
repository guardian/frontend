package services

import com.ning.http.client.AsyncHttpClient
import com.ning.http.client.AsyncHttpClientConfig.Builder
import common.TestWsConfig
import org.scalatest.{DoNotDiscover, FlatSpec, Matchers}
import play.api.libs.ws.WS
import play.api.libs.ws.ning.NingWSClient
import test._

import scala.concurrent.Await
import scala.concurrent.duration._

@DoNotDiscover class OnwardHealthcheckTest extends FlatSpec with Matchers with ConfiguredTestSuite with TestWsConfig {

  "Healthchecks" should "pass" in goTo("/most-read.json"){ _ =>

    Await.result(WS.clientUrl(s"http://localhost:${port}/_healthcheck").get(), 10.seconds).status should be (200)
  }

}
