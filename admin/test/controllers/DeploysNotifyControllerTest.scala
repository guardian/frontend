package controllers.admin

import common.ExecutionContexts
import controllers.Helpers.DeploysTestHttpRecorder
import model.deploys._
import org.scalatest.{BeforeAndAfterAll, DoNotDiscover, Matchers, WordSpec}
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.test.Helpers._
import play.api.test.{FakeHeaders, FakeRequest}
import test.{ConfiguredTestSuite, WithTestWsClient}

import scala.concurrent.Future

@DoNotDiscover class DeploysNotifyControllerTest
  extends WordSpec
  with Matchers
  with ConfiguredTestSuite
  with ExecutionContexts
  with BeforeAndAfterAll
  with WithTestWsClient {

  val existingBuild = "3123"
  val fakeApiKey = "fake-api-key"

  class RecordingHttpClient(key: String, wsClient: WSClient) extends HttpLike {
    override def GET(url: String, queryString: Map[String, String] = Map.empty, headers: Map[String, String] = Map.empty) = {
      import implicits.Strings.string2encodings
      val urlWithParams = url + "?" + queryString.updated("key", "").toList.sortBy(_._1).map(kv=> kv._1 + "=" + kv._2).mkString("&").encodeURIComponent
      DeploysTestHttpRecorder.load(key, urlWithParams, headers) {
        wsClient.url(url).withQueryString(queryString.toSeq: _*).withHeaders(headers.toSeq: _*).withRequestTimeout(10000).get()
      }
    }
  }



  class DeploysNotifyControllerStub(override val wsClient: WSClient) extends DeploysNotifyController {
    lazy val apiKey = fakeApiKey

    override val teamcity = new TeamcityService(new RecordingHttpClient("teamcity", wsClient))
    override val riffRaff = new RiffRaffService(new RecordingHttpClient("riffraff", wsClient))

    override protected def sendNotice(step: NoticeStep, notice: Notice): Future[NoticeResponse] = {
      Future.successful(NoticeResponse(notice, "Fake response"))
    }
  }

  val controller = new DeploysNotifyControllerStub(wsClient)

    s"POST /deploys-radiator/api/builds/${existingBuild}/notify" when {

      "No Api key is supplied" should {
        val body = Json.parse("""{"step": "deploy-finished-code",
                                |"notices": [{
                                | "type": "slack",
                                | "data": {
                                | "username": "TestUser",
                                | "hookUrl": "https://hooks.slack.com/services/X/Y/Z"
                                | }}]}""".stripMargin)
        val headers = FakeHeaders(Seq("Content-Type" -> "application/json"))
        val postNotifyRequest = FakeRequest("POST", s"/deploys-radiator/api/builds/${existingBuild}/notify", headers, body)
        "returns 401" in {
          val response = call(controller.notifyStep(existingBuild), postNotifyRequest)
          status(response) should be(UNAUTHORIZED)
        }
      }

      "step doesn't exist" should {
        val body = Json.parse("""{"step": "this step does NOT exist",
                                |"notices": [{
                                | "type": "slack",
                                | "data": {
                                | "username": "TestUser",
                                | "hookUrl": "https://hooks.slack.com/services/X/Y/Z"
                                | }}]}""".stripMargin)
        val headers = FakeHeaders(Seq("Content-Type" -> "application/json", "X-Gu-Api-Key" -> fakeApiKey))
        val postNotifyRequest = FakeRequest("POST", s"/deploys-radiator/api/builds/${existingBuild}/notify", headers, body)
        "returns 400" in {
          val response = call(controller.notifyStep(existingBuild), postNotifyRequest)
          status(response) should be(BAD_REQUEST)
        }
      }

      "notices info is not provided doesn't exist" should {
        val body = Json.parse("""{"step": "deploy-finished-code"}""")
        val headers = FakeHeaders(Seq("Content-Type" -> "application/json", "X-Gu-Api-Key" -> fakeApiKey))
        val postNotifyRequest = FakeRequest("POST", s"/deploys-radiator/api/builds/${existingBuild}/notify", headers, body)
        "returns 400" in {
          val response = call(controller.notifyStep(existingBuild), postNotifyRequest)
          status(response) should be(BAD_REQUEST)
        }
      }

      "notice type doesn't exist" should {
        val body = Json.parse("""{"step": "deploy-finished-code",
                                |"notices": [{
                                | "type": "doesn't exist"
                                | }]}""".stripMargin)
        val headers = FakeHeaders(Seq("Content-Type" -> "application/json", "X-Gu-Api-Key" -> fakeApiKey))
        val postNotifyRequest = FakeRequest("POST", s"/deploys-radiator/api/builds/${existingBuild}/notify", headers, body)
        "returns 400" in {
          val response = call(controller.notifyStep(existingBuild), postNotifyRequest)
          status(response) should be(BAD_REQUEST)
        }
      }

      "Slack data doesn't have a hookUrl" should {
        val body = Json.parse("""{"step": "deploy-finished-code",
                                |"notices": [{
                                | "type": "slack",
                                | "data": {
                                | "username": "TestUser"
                                | }}]}""".stripMargin)
        val headers = FakeHeaders(Seq("Content-Type" -> "application/json", "X-Gu-Api-Key" -> fakeApiKey))
        val postNotifyRequest = FakeRequest("POST", s"/deploys-radiator/api/builds/${existingBuild}/notify", headers, body)
        "returns 400" in {
          val response = call(controller.notifyStep(existingBuild), postNotifyRequest)
          status(response) should be(BAD_REQUEST)
        }
      }

      "data to send a notice to Slack is correct" should {
        val body = Json.parse("""{"step": "deploy-finished-code",
                                |"notices": [{
                                | "type": "slack",
                                | "data": {
                                | "username": "TestUser",
                                | "hookUrl": "https://hooks.slack.com/services/X/Y/Z"
                                | }}]}""".stripMargin)
        val headers = FakeHeaders(Seq("Content-Type" -> "application/json", "X-Gu-Api-Key" -> fakeApiKey))
        val postNotifyRequest = FakeRequest("POST", s"/deploys-radiator/api/builds/${existingBuild}/notify", headers, body)
        "returns 200" in {
          val response = call(controller.notifyStep(existingBuild), postNotifyRequest)
          status(response) should be(OK)
        }
      }

      // RiffRaff hooks, for instance, doesn't give the opportunity to pass headers
      // So we would pass the api-key as query string in this case
      "api-key is passed as query string" should {
        val body = Json.parse("""{"step": "deploy-finished-code",
                                |"notices": [{
                                | "type": "slack",
                                | "data": {
                                | "username": "TestUser",
                                | "hookUrl": "https://hooks.slack.com/services/X/Y/Z"
                                | }}]}""".stripMargin)
        val headers = FakeHeaders(Seq("Content-Type" -> "application/json"))
        val postNotifyRequest = FakeRequest("POST", s"/deploys-radiator/api/builds/${existingBuild}/notify?api-key=${fakeApiKey}", headers, body)
        "returns 200" in {
          val response = call(controller.notifyStep(existingBuild), postNotifyRequest)
          status(response) should be(OK)
        }
      }

    }
}



