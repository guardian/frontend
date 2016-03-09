package controllers.admin

import java.io.{File, InputStream}
import java.nio.ByteBuffer
import java.util
import com.ning.http.client.uri.Uri
import com.ning.http.client.{FluentCaseInsensitiveStringsMap, Response => ningResponse}
import common.ExecutionContexts
import org.scalatest.{DoNotDiscover, Matchers, WordSpec}
import play.api.libs.json.JsArray
import play.api.libs.ws.{WS, WSResponse}
import play.api.libs.ws.ning.NingWSResponse
import play.api.test.FakeRequest
import play.api.test.Helpers._
import recorder.HttpRecorder
import test.ConfiguredTestSuite

@DoNotDiscover class DeploysRadiatorControllerTest extends WordSpec with Matchers with ConfiguredTestSuite with ExecutionContexts {

  class DeploysRadiatorControllerStub extends DeploysRadiatorController {
    override protected def GET(url: String, queryString: Map[String, String] = Map.empty, headers: Map[String, String] = Map.empty) = {
      val extentedHeaders = headers + ("X-Url"-> (url + queryString.mkString))
      DeployRadiatorTestHttpRecorder.load(url, extentedHeaders) {
        WS.url(url).withQueryString(queryString.toSeq: _*).withHeaders(headers.toSeq: _*).withRequestTimeout(10000).get()
      }
    }
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

  "GET /deploys-radiator/api/builds/1300" should {
    val buildNumber = "1300"
    val getDeploysRequest = FakeRequest(method = "GET", path = s"/deploys-radiator/api/builds/${buildNumber}")
    "returns 200" in {
      val response = call(controller.getBuild(buildNumber), getDeploysRequest)

      status(response) should be(OK)

      val jsonResponse = contentAsJson(response)
      (jsonResponse \ "status").as[String] should be("ok")
      (jsonResponse \ "response" \ "number").as[String] should be(buildNumber)
      (jsonResponse \ "response" \ "projectName").as[String] should be("dotcom::master")
      ((jsonResponse \ "response" \ "commits").as[JsArray]).value.size should be(3)
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

object DeployRadiatorTestHttpRecorder extends HttpRecorder[WSResponse] {
  override lazy val baseDir = new File(System.getProperty("user.dir"), "data/deploy-radiator")

  val errorPrefix = "Error:"
  def toResponse(str: String) = {
    if (str.startsWith(errorPrefix)) {
      NingWSResponse(Response("", str.replace(errorPrefix, "").toInt))
    } else {
      NingWSResponse(Response(str, 200))
    }
  }

  def fromResponse(response: WSResponse) = {
    if (response.status == 200) {
      response.body
    }
    else {
      errorPrefix + response.status
    }
  }
}

private case class Response(getResponseBody: String, status: Int) extends ningResponse {
  def getContentType: String = "application/json"
  def getResponseBody(charset: String): String = getResponseBody
  def getStatusCode: Int = status
  def getResponseBodyAsBytes: Array[Byte] = getResponseBody.getBytes
  def getResponseBodyAsByteBuffer: ByteBuffer = throw new NotImplementedError()
  def getResponseBodyAsStream: InputStream = throw new NotImplementedError()
  def getResponseBodyExcerpt(maxLength: Int, charset: String): String = throw new NotImplementedError()
  def getResponseBodyExcerpt(maxLength: Int): String = throw new NotImplementedError()
  def getStatusText: String = throw new NotImplementedError()
  def getUri: Uri = throw new NotImplementedError()
  def getHeader(name: String): String = throw new NotImplementedError()
  def getHeaders(name: String): util.List[String] = throw new NotImplementedError()
  def getHeaders: FluentCaseInsensitiveStringsMap = throw new NotImplementedError()
  def isRedirected: Boolean = throw new NotImplementedError()
  def getCookies = throw new NotImplementedError()
  def hasResponseStatus: Boolean = throw new NotImplementedError()
  def hasResponseHeaders: Boolean = throw new NotImplementedError()
  def hasResponseBody: Boolean = throw new NotImplementedError()
}

