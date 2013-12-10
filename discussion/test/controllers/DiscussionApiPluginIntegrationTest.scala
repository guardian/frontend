package controllers

import org.scalatest.{FlatSpecLike, Matchers, BeforeAndAfterAll, FlatSpec}
import org.scalatest.matchers.ShouldMatchers
import scala.concurrent.{Future, Await}
import scala.language.postfixOps
import scala.concurrent.duration._
import play.api.mvc.{Headers, Action}
import play.api.mvc.Results._
import play.api.test._
import play.api.libs.json.JsValue

class DiscussionApiPluginIntegrationTest extends DiscussionApiPlugin(null) with FlatSpecLike with Matchers with BeforeAndAfterAll {

  val fakeDiscussionApiServer = FakeDiscussionServer()

  override def beforeAll() {
    fakeDiscussionApiServer.instance.start()
  }

  "DiscussionApiPlugin getJsonOrError " should "send GU-Client headers and other headers in GET request" in {
    val someOtherHeader = ("some-other-header-key", "some-other-header-value")

    val responseFuture: Future[JsValue] =
      getJsonOrError(
        fakeDiscussionApiServer.testUrl,
        onErrorResponse => "there was an error",
        someOtherHeader)

    Await.ready(responseFuture, 2 seconds)

    fakeDiscussionApiServer.headersReceived.get("GU-Client") should be("nextgen-dev")
    fakeDiscussionApiServer.headersReceived.get("some-other-header-key") should be("some-other-header-value")
  }

  override def afterAll() {
    fakeDiscussionApiServer.instance.stop()
  }
}

case class FakeDiscussionServer() {
  private val testServerPort: Int = 1902
  val instance = TestServer(testServerPort, return200_OK_ifCorrectHeadersSent)
  var headersReceived: Option[Headers] = None

  def testUrl = s"http://localhost:$testServerPort/test-url"

  private def return200_OK_ifCorrectHeadersSent(): FakeApplication = {
    FakeApplication(withRoutes = {
      case ("GET", "/test-url") => Action {
        request => {
          headersReceived = Option(request.headers)
          Ok("{}")
        }
      }
    }
    )
  }

}
