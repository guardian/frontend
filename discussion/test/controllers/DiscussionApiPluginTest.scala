package controllers

import org.scalatest.{BeforeAndAfterAll, FlatSpec}
import org.scalatest.matchers.ShouldMatchers
import scala.concurrent.Await
import scala.language.postfixOps
import scala.concurrent.duration._
import play.api.mvc.Action
import play.api.mvc.Results._
import play.api.test._
import play.api.http.{Status => HttpStatus}


class DiscussionApiPluginTest extends DiscussionApiPlugin(null) with FlatSpec with ShouldMatchers with BeforeAndAfterAll {

  val testServerPort: Int = 1902

  val fakeDiscussionApiServer = TestServer(testServerPort, return200_OK_ifCorrectHeadersSent)


  def return200_OK_ifCorrectHeadersSent: FakeApplication = {
    FakeApplication(withRoutes = {
      case ("GET", "/test-url") => Action {
        request =>
          if (request.headers("GU-Client") == "nextgen-dev")
            Ok("Correct headers sent")
          else BadRequest("Expected headers not sent")
      }
    }
    )
  }

  override def beforeAll() {
    fakeDiscussionApiServer.start()
  }

  "DiscussionApiPlugin" should "send GU-Client headers in GET request" in {
    val responseFuture = GET(s"http://localhost:$testServerPort/test-url")
    val response = Await.result(responseFuture, 2 seconds)
    response.status should be(HttpStatus.OK)
  }

  override def afterAll() {
    fakeDiscussionApiServer.stop()
  }

}

//pull from properties