package controllers

import common.ExecutionContexts
import org.mockito.Matchers._
import org.mockito.Mockito._
import org.scalatest.mock.MockitoSugar
import org.scalatest.{DoNotDiscover, Matchers, WordSpec}
import play.api.libs.json.{JsValue, Json}
import play.api.test.FakeRequest
import play.api.test.Helpers._
import test.ConfiguredTestSuite

import scala.concurrent.Future

@DoNotDiscover class NewsAlertControllerTest extends WordSpec with Matchers with ConfiguredTestSuite with MockitoSugar with ExecutionContexts{

  def newControllerAndMockApi = {
    val mockBreakingNewsApi = mock[BreakingNewsApi]
    val controller = new NewsAlertController {
      override val breakingNewsApi: BreakingNewsApi = mockBreakingNewsApi
    }
    (controller, mockBreakingNewsApi)
  }

  "GET /news-alert/alerts" when {
    val getAlertsRequest = FakeRequest(method = "GET", path = "/news-alert/alerts")
    "no content is available" should {
      val (controller, mockBreakingNewsApi) = newControllerAndMockApi
      when(mockBreakingNewsApi.getBreakingNews) thenReturn Future(None)
      "204" in {
        val response = call(controller.alerts, getAlertsRequest)
        status(response) should be(NO_CONTENT)
      }
    }
    "json content is available" should {
      val (controller, mockBreakingNewsApi) = newControllerAndMockApi
      val validJson = Json.parse("""{"field": "value"}""")
      when(mockBreakingNewsApi.getBreakingNews) thenReturn Future(Some(validJson))
      "200" in {
        val response = call(controller.alerts, getAlertsRequest)
        status(response) should be(OK)
      }
      "have Content-Type header set to 'application/json'" in {
        val response = call(controller.alerts, getAlertsRequest)
        header("Content-Type", response) match {
          case Some(h) => h should startWith("application/json")
          case _ => assert(false)
        }
      }
      "return json content" in {
        val response = call(controller.alerts, getAlertsRequest)
        contentAsJson(response) should equal(validJson)
      }
    }
  }

  "POST /news-alert/alert" when {
    val postAlertRequest = FakeRequest(method = "POST", path = "/news-alert/alert").withHeaders(("Content-Type", "application/json"))

    val (controller, mockBreakingNewsApi) = newControllerAndMockApi

    "request body is empty" should {
      "400" in {
        val response = call(controller.create, postAlertRequest)
        status(response) should be(BAD_REQUEST)
      }
    }

    "mandatory fields in request body are empty" should {
      val jsonBody = Json.parse(
        """{"id":"c3def817-ab16-4d1d-9eae-c090a5c753f9",
          |"title":"This is a breaking news title",
          |"publicationDate":"2016-01-18T12:21:01.000Z"}""".stripMargin)
      "400" in {
        val request = postAlertRequest.withJsonBody(jsonBody)
        val response = call(controller.create, request)
        status(response) should be(BAD_REQUEST)
      }
    }

    "request body is valid" when {
      val jsonBody = Json.parse(
        """{"id":"c3def817-ab16-4d1d-9eae-c090a5c753f9",
          |"title":"This is a breaking news title",
          |"message":"This is a breaking news message",
          |"thumbnailUrl":"http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg",
          |"link":"http://gu.com/p/4fgcd",
          |"imageUrl":"http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg",
          |"publicationDate":"2016-01-18T12:21:01.000Z",
          |"topics":["breaking/us"]}""".stripMargin)
      val request = postAlertRequest.withJsonBody(jsonBody)

      "fetching previous Breaking News" which  {
        "fails" should  {
          val (controller, mockBreakingNewsApi) = newControllerAndMockApi
          when(mockBreakingNewsApi.getBreakingNews) thenReturn Future.failed(new Exception())
          "500" in {
            val response = call(controller.create, request)
            status(response) should be(INTERNAL_SERVER_ERROR)
          }
        }
        "succeeds " when  {
          "parsing previous Breaking News" which {
            "fails" should {
              val (controller, mockBreakingNewsApi) = newControllerAndMockApi
              when(mockBreakingNewsApi.getBreakingNews) thenReturn Future(Some(Json.parse( """{"valid": "json", "but": "not", "breaking": "news"}""")))
              "500" in {
                val response = call(controller.create, request)
                status(response) should be(INTERNAL_SERVER_ERROR)
              }
            }
            "succeeds" when {
              val emptyBreakingNewsJson = Json.parse(
                s"""{
                    |"collections": [
                    |{
                    |"displayName": "UK alerts",
                    |"href": "uk",
                    |"content": []
                    |},
                    |{
                    |"displayName": "US alerts",
                    |"href": "us",
                    |"content": []
                    |},
                    |{
                    |"displayName": "AU alerts",
                    |"href": "au",
                    |"content": []
                    |},
                    |{
                    |"displayName": "Sport alerts",
                    |"href": "sport",
                    |"content": []
                    |},
                    |{
                    |"displayName": "International alerts",
                    |"href": "international",
                    |"content": []
                    |}
                    |]
                    |}""".stripMargin)
              "saving updated Breaking News" which {
                "fails" should {
                  val (controller, mockBreakingNewsApi) = newControllerAndMockApi
                  when(mockBreakingNewsApi.getBreakingNews) thenReturn Future(Some(emptyBreakingNewsJson))
                  when(mockBreakingNewsApi.putBreakingNews(any[JsValue])) thenReturn Future.failed(new Exception())
                  "500" in {
                    val response = call(controller.create, request)
                    status(response) should be(INTERNAL_SERVER_ERROR)
                  }
                }
                "succeeds" should {
                  val (controller, mockBreakingNewsApi) = newControllerAndMockApi
                  when(mockBreakingNewsApi.getBreakingNews) thenReturn Future(Some(emptyBreakingNewsJson))
                  when(mockBreakingNewsApi.putBreakingNews(any[JsValue])) thenReturn Future(())
                  "201" in {
                    val response = call(controller.create, request)
                    status(response) should be(CREATED)
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
