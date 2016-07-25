package controllers.admin

import common.ExecutionContexts
import controllers.Helpers.DeploysTestHttpRecorder
import model.deploys._
import org.scalatest.{DoNotDiscover, Matchers, WordSpec}
import play.api.libs.json.JsArray
import play.api.libs.ws.WSClient
import play.api.test.FakeRequest
import play.api.test.Helpers._
import test.ConfiguredTestSuite

@DoNotDiscover class DeploysRadiatorControllerTest extends WordSpec with Matchers with ConfiguredTestSuite with ExecutionContexts {

  val existingBuild = "1621"

  class TestHttpClient(wsClient: WSClient) extends HttpLike {
    override def GET(url: String, queryString: Map[String, String] = Map.empty, headers: Map[String, String] = Map.empty) = {
      val extentedHeaders = headers + ("X-Url" -> (url + queryString.mkString))
      DeploysTestHttpRecorder.load(url, extentedHeaders) {
        wsClient.url(url).withQueryString(queryString.toSeq: _*).withHeaders(headers.toSeq: _*).withRequestTimeout(10000).get()
      }
    }
  }

  val recordingHttpClient = new TestHttpClient(wsClient)

  class DeploysRadiatorControllerStub extends DeploysRadiatorController {
    override val teamcity = TeamcityService(recordingHttpClient)
    override val riffRaff = RiffRaffService(recordingHttpClient)
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
      ((jsonResponse \ "response" \ "commits").as[JsArray]).value.size should be(7)
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

