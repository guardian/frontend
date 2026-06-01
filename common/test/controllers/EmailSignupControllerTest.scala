package controllers

import org.mockito.ArgumentMatchers._
import org.mockito.Mockito._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.mockito.MockitoSugar
import play.api.libs.json._
import play.api.libs.ws._
import play.api.test.FakeRequest
import play.api.test.Helpers._
import play.filters.csrf.CSRFAddToken
import services.newsletters.NewsletterSignupAgent
import test.{WithTestApplicationContext, WithTestExecutionContext}

import scala.concurrent.Future

class EmailSignupControllerTest
    extends AnyWordSpec
    with Matchers
    with MockitoSugar
    with ScalaFutures
    with WithTestExecutionContext
    with WithTestApplicationContext {

  trait Fixture {
    val wsClient: WSClient = mock[WSClient]
    val wsRequest: WSRequest = mock[WSRequest]
    val wsResponse: WSResponse = mock[WSResponse]
    val newsletterSignupAgent: NewsletterSignupAgent = mock[NewsletterSignupAgent]
    val csrfAddToken: CSRFAddToken = mock[CSRFAddToken]

    val controller = new EmailSignupController(
      wsClient,
      play.api.test.Helpers.stubControllerComponents(),
      csrfAddToken,
      newsletterSignupAgent,
    )

    when(newsletterSignupAgent.getV2NewsletterByName(any[String])) thenReturn Left("not found")
    when(wsClient.url(any[String])) thenReturn wsRequest
    when(wsRequest.withQueryStringParameters(any())) thenReturn wsRequest
    when(wsRequest.addHttpHeaders(any())) thenReturn wsRequest
    when(wsRequest.post(any[JsValue])(any[BodyWritable[JsValue]])) thenReturn Future.successful(wsResponse)
    when(wsResponse.status) thenReturn 200

    def formRequest(fields: (String, String)*) =
      FakeRequest(POST, "/email")
        .withFormUrlEncodedBody(fields: _*)
        .withHeaders("Accept" -> "application/json")
  }

  "EmailSignupController.submit" when {

    "botHoneyPot is populated with a non-empty string" should {
      "return 403 Forbidden" in new Fixture {
        val request = formRequest(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
          "botHoneyPot" -> "I am a bot",
        )
        val result = controller.submit()(request)
        status(result) shouldBe FORBIDDEN
      }
    }

    "botHoneyPot field is not present in the request" should {
      "return a successful request" in new Fixture {
        val request = formRequest(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
        )
        val result = controller.submit()(request)
        status(result) should not be FORBIDDEN
      }
    }

    "botHoneyPot is present but set to an empty string" should {
      "return a successful request" in new Fixture {
        val request = formRequest(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
          "botHoneyPot" -> "",
        )
        val result = controller.submit()(request)
        status(result) should not be FORBIDDEN
      }
    }
  }
}
