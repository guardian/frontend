import org.scalatest.{Matchers, FlatSpec, DoNotDiscover}
import play.api.libs.ws.WS
import test.ConfiguredTestSuite

import scala.concurrent.Await
import scala.concurrent.duration._

@DoNotDiscover class WeatherHealthcheckTest extends FlatSpec with Matchers with ConfiguredTestSuite {
  "Healthchecks" should "pass" in goTo("/weather/city.json"){ _ =>
    Await.result(WS.url(s"http://localhost:${port}/_healthcheck").get(), 10.seconds).status should be (200)
  }
}
