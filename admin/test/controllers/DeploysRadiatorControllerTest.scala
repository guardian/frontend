package controllers.admin

import common.ExecutionContexts
import controllers.Helpers.DeploysTestHttpRecorder
import model.deploys._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, Matchers, WordSpec}
import play.api.libs.json.JsArray
import play.api.libs.ws.WSClient
import play.api.test.FakeRequest
import play.api.test.Helpers._
import test.{ConfiguredTestSuite, WithTestWsClient}

@DoNotDiscover class DeploysRadiatorControllerTest
  extends WordSpec
  with Matchers
  with ConfiguredTestSuite
  with ExecutionContexts
  with BeforeAndAfterAll
  with WithTestWsClient {

  val existingBuild = "3123"

  class TestHttpClient(wsClient: WSClient) extends HttpLike {
    override def GET(url: String, queryString: Map[String, String] = Map.empty, headers: Map[String, String] = Map.empty) = {
      import implicits.Strings.string2encodings
      val urlWithParams = url + "?" + queryString.updated("key", "").toList.sortBy(_._1).map(kv=> kv._1 + "=" + kv._2).mkString("&").encodeURIComponent
      DeploysTestHttpRecorder.load(urlWithParams, headers) {
        wsClient.url(url).withQueryString(queryString.toSeq: _*).withHeaders(headers.toSeq: _*).withRequestTimeout(10000).get()
      }
    }
  }

  class DeploysRadiatorControllerStub extends DeploysRadiatorController {
    private val httpClient = new TestHttpClient(wsClient)
    override val teamcity = new TeamcityService(httpClient)
    override val riffRaff = new RiffRaffService(httpClient)
  }

  val controller = new DeploysRadiatorControllerStub()

  "GET /deploys-radiator/api/deploys" should {
    val getDeploysRequest = FakeRequest(method = "GET", path = "/deploys-radiator/api/deploys")
    "returns 200 with expected amount of results when project and stage exists" in {
      val pageSize = 10
      val projectName = "dotcom:facia-press"
      val stage = "PROD"
      val response = call(controller.getDeploys(pageSize = Some(s"${pageSize}"), projectName = Some(projectName), stage = Some(stage)), getDeploysRequest)

      status(response) should be(OK)

      val jsonResponse = contentAsJson(response)
      ((jsonResponse \ "response").as[JsArray]).value.size should be(pageSize)
      (jsonResponse \ "status").as[String] should be("ok")
      (jsonResponse \ "response" \\ "projectName").map(_.as[String]).distinct should equal(List(projectName))
      (jsonResponse \ "response" \\ "projectName").map(_.as[String]).distinct should equal(List(projectName))
      (jsonResponse \ "response" \\ "stage").map(_.as[String]).distinct should equal(List(stage))
    }
    "returns 200 with no results when project and stage don't exist" in {
      val projectName = "does-not-exist"
      val stage = "does-not-exist-neither"
      val response = call(controller.getDeploys(pageSize = None, projectName = Some(projectName), stage = Some(stage)), getDeploysRequest)

      status(response) should be(OK)

      val jsonResponse = contentAsJson(response)
      ((jsonResponse \ "response").as[JsArray]).value.size should be(0)
      (jsonResponse \ "status").as[String] should be("ok")
    }
  }

  s"GET /deploys-radiator/api/builds/${existingBuild}" should {
    val getDeploysRequest = FakeRequest(method = "GET", path = s"/deploys-radiator/api/builds/${existingBuild}")
    "returns 200" in {
      val response = call(controller.getBuild(existingBuild), getDeploysRequest)

      status(response) should be(OK)

      val jsonResponse = contentAsJson(response)
      (jsonResponse \ "status").as[String] should be("ok")
      (jsonResponse \ "response" \ "number").as[String] should be(existingBuild)
      (jsonResponse \ "response" \ "projectName").as[String] should be("dotcom:master")
      ((jsonResponse \ "response" \ "commits").as[JsArray]).value.size should be(2)
    }
  }

  "GET /deploys-radiator/api/builds/999999999" should {
    val buildNumber = "999999999"
    val getDeploysRequest = FakeRequest(method = "GET", path = s"/deploys-radiator/api/builds/${buildNumber}")
    "returns 500" in {
      val response = call(controller.getBuild(buildNumber), getDeploysRequest)

      status(response) should be(INTERNAL_SERVER_ERROR)

      val jsonResponse = contentAsJson(response)
      (jsonResponse \ "status").as[String] should be("error")
      (jsonResponse \ "statusCode").as[Int] should be(INTERNAL_SERVER_ERROR)
      ((jsonResponse \ "errors").as[JsArray]).value.size should be >=(1)
    }
  }
}

