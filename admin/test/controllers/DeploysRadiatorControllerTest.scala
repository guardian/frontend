package controllers.admin

import controllers.Helpers.DeploysTestHttpRecorder
import model.deploys._
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover}
import play.api.libs.json.JsArray
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.ControllerComponents
import play.api.test.{FakeRequest, Helpers}
import play.api.test.Helpers._
import test.{ConfiguredTestSuite, WithMaterializer, WithTestExecutionContext, WithTestWsClient}

import scala.concurrent.Future
import scala.concurrent.duration._

@DoNotDiscover class DeploysControllerTest
    extends AnyWordSpec
    with Matchers
    with ConfiguredTestSuite
    with BeforeAndAfterAll
    with WithMaterializer
    with WithTestExecutionContext
    with WithTestWsClient {

  val existingBuild = "3123"

  class TestHttpClient(wsClient: WSClient) extends HttpLike {
    override def GET(
        url: String,
        queryString: Map[String, String] = Map.empty,
        headers: Map[String, String] = Map.empty,
    ): Future[WSResponse] = {
      import implicits.Strings.string2encodings
      val urlWithParams = url + "?" + queryString
        .updated("key", "")
        .toList
        .sortBy(_._1)
        .map(kv => kv._1 + "=" + kv._2)
        .mkString("&")
        .encodeURIComponent
      DeploysTestHttpRecorder.load(urlWithParams, headers) {
        wsClient
          .url(url)
          .withQueryStringParameters(queryString.toSeq: _*)
          .withHttpHeaders(headers.toSeq: _*)
          .withRequestTimeout(10.seconds)
          .get()
      }
    }
  }

  class DeploysControllerStub(val controllerComponents: ControllerComponents) extends DeploysController {
    private val httpClient = new TestHttpClient(wsClient)
    override val riffRaff = new RiffRaffService(httpClient)
  }

  lazy val controller = new DeploysControllerStub(Helpers.stubControllerComponents())

  "GET /deploys" should {
    val getDeploysRequest = FakeRequest(method = "GET", path = "/deploys")
    "returns 200 with expected amount of results" in {
      val projectName = "dotcom:all"
      val stage = "PROD"
      val pageSize = 10
      val response = call(controller.getDeploys(stage = Some(stage), pageSize = Some(pageSize)), getDeploysRequest)

      status(response) should be(OK)

      val jsonResponse = contentAsJson(response)
      (jsonResponse \ "response").as[JsArray].value.size should be(pageSize)
      (jsonResponse \ "status").as[String] should be("ok")
      (jsonResponse \ "response" \\ "projectName").map(_.as[String]).distinct should equal(List(projectName))
      (jsonResponse \ "response" \\ "projectName").map(_.as[String]).distinct should equal(List(projectName))
      (jsonResponse \ "response" \\ "stage").map(_.as[String]).distinct should equal(List(stage))
    }
  }
}
