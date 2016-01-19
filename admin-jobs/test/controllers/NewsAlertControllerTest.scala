package controllers

import org.scalatest.{DoNotDiscover, WordSpec, Matchers}
import play.api.libs.json.Json
import play.api.test.Helpers._
import play.api.test.FakeRequest

import test.ConfiguredTestSuite

@DoNotDiscover class NewsAlertControllerTest extends WordSpec with Matchers with ConfiguredTestSuite {

  "GET /news-alert/alerts" should {
    "200" in {
      val getAlertsRequest = FakeRequest(method = "GET", path = "/news-alert/alerts")
      val response = route(getAlertsRequest).get
      status(response) should be(OK)
    }
  }

  "POST /news-alert/alert" when {

    val postAlertRequest = FakeRequest(method = "POST", path = "/news-alert/alert").withHeaders(("Content-Type", "application/json"))

    "body is empty" should {
      "400" in {
        val response = route(postAlertRequest).get
        status(response) should be(BAD_REQUEST)
      }

    }

    "mandatory fields are empty" should {
      val jsonBody = Json.parse(
        """{"id":"c3def817-ab16-4d1d-9eae-c090a5c753f9",
          |"title":"This is a breaking news title",
          |"publicationDate":"2016-01-18T12:21:01.000Z"}""".stripMargin)
      "400" in {
        val request = postAlertRequest.withJsonBody(jsonBody)
        val response = route(request).get
        status(response) should be(BAD_REQUEST)
      }
    }
    "all fields are provided" should {

      val jsonBody = Json.parse("""{"id":"c3def817-ab16-4d1d-9eae-c090a5c753f9",
                                  |"title":"This is a breaking news title",
                                  |"message":"This is a breaking news message",
                                  |"thumbnailUrl":"http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg",
                                  |"link":"http://gu.com/p/4fgcd",
                                  |"imageUrl":"http://i.guimcode.co.uk.global.prod.fastly.net/img/media/54c2dc737fc82bf793dd919694e3ea7111cf2d82/0_169_3936_2363/140.jpg",
                                  |"publicationDate":"2016-01-18T12:21:01.000Z"}""".stripMargin)
      val request = postAlertRequest.withJsonBody(jsonBody)
      def response = route(request).get

      "200" in {
        status(response) should be(CREATED)
      }
      "return the created notification" in {
        contentAsJson(response) should equal(jsonBody)
      }
    }
  }

}
