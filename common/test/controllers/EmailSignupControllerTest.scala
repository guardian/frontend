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
import services.newsletters.{GoogleRecaptchaValidationService, NewsletterSignupAgent}
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
    val identityWsRequest: WSRequest = mock[WSRequest]
    val identityWsResponse: WSResponse = mock[WSResponse]
    val recaptchaWsResponse: WSResponse = mock[WSResponse]
    val recaptchaValidationService: GoogleRecaptchaValidationService = mock[GoogleRecaptchaValidationService]
    val newsletterSignupAgent: NewsletterSignupAgent = mock[NewsletterSignupAgent]
    val csrfAddToken: CSRFAddToken = mock[CSRFAddToken]

    val controller = new EmailSignupController(
      wsClient,
      play.api.test.Helpers.stubControllerComponents(),
      csrfAddToken,
      newsletterSignupAgent,
    ) {
      override val googleRecaptchaTokenValidationService: GoogleRecaptchaValidationService = recaptchaValidationService
    }

    when(newsletterSignupAgent.getV2NewsletterByName(any[String])) thenReturn Left("not found")
    when(wsClient.url(any[String])) thenReturn identityWsRequest
    when(identityWsRequest.withQueryStringParameters(any())) thenReturn identityWsRequest
    when(identityWsRequest.addHttpHeaders(any())) thenReturn identityWsRequest
    when(identityWsRequest.post(any[JsValue])(any[BodyWritable[JsValue]])) thenReturn Future.successful(
      identityWsResponse,
    )
    when(recaptchaValidationService.submit(any[String], anyBoolean())) thenReturn Future.successful(recaptchaWsResponse)
    when(identityWsResponse.status) thenReturn 200
    when(recaptchaWsResponse.json) thenReturn Json.obj("success" -> true)

    def formRequest(accept: String = "application/json")(fields: (String, String)*) =
      FakeRequest(POST, "/email")
        .withFormUrlEncodedBody(fields: _*)
        .withHeaders("Accept" -> accept)
  }

  "EmailSignupController.submit" when {

    "country (bot honey pot field) is populated with a non-empty string" should {
      "return a success response without calling the Identity API" in new Fixture {
        val request = formRequest()(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
          "country" -> "I am a bot",
        )
        val result = controller.submit()(request)
        status(result) shouldBe CREATED
        verify(wsClient, never()).url(any[String])
      }
    }

    "country (bot honey pot field) field is not present in the request" should {
      "return a successful request" in new Fixture {
        val request = formRequest()(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
        )
        val result = controller.submit()(request)
        status(result) should not be FORBIDDEN
      }
    }

    "country (bot honey pot field) is present but set to an empty string" should {
      "return a successful request" in new Fixture {
        val request = formRequest()(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
          "country" -> "",
        )
        val result = controller.submit()(request)
        status(result) should not be FORBIDDEN
      }
    }

    "the reCAPTCHA token is missing" should {
      "return a bad request response for JSON clients" in new Fixture {
        val request = formRequest()(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
        )

        val result = controller.submit()(request)

        status(result) shouldBe BAD_REQUEST
        contentAsString(result) shouldBe "Missing reCAPTCHA token"
      }
    }

    "the reCAPTCHA token is invalid" should {
      "return a bad request response for JSON clients" in new Fixture {
        when(recaptchaWsResponse.json) thenReturn Json.obj(
          "success" -> false,
          "error-codes" -> Json.arr("invalid-input-response"),
        )

        val request = formRequest()(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
          "g-recaptcha-response" -> "bad-token",
        )

        val result = controller.submit()(request)

        status(result) shouldBe BAD_REQUEST
        contentAsString(result) shouldBe "Invalid reCAPTCHA token"
      }
    }

    "the upstream subscription service returns a non-success status" should {
      "return a bad gateway response for JSON clients" in new Fixture {
        when(identityWsResponse.status) thenReturn BAD_GATEWAY

        val request = formRequest()(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
          "g-recaptcha-response" -> "good-token",
        )

        val result = controller.submit()(request)

        status(result) shouldBe BAD_GATEWAY
        contentAsString(result) shouldBe "Email subscription service returned an unexpected response"
      }
    }

    "the upstream subscription service is unavailable" should {
      "return a service unavailable response for JSON clients" in new Fixture {
        when(identityWsRequest.post(any[JsValue])(any[BodyWritable[JsValue]])) thenReturn Future.failed(
          new RuntimeException("boom"),
        )

        val request = formRequest()(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
          "g-recaptcha-response" -> "good-token",
        )

        val result = controller.submit()(request)

        status(result) shouldBe SERVICE_UNAVAILABLE
        contentAsString(result) shouldBe "Email subscription service unavailable"
      }
    }

    "an error response is returned to an HTML client" should {
      "preserve the existing error redirect" in new Fixture {
        val request = formRequest("text/html")(
          "email" -> "test@example.com",
          "listName" -> "test-newsletter",
        )

        val result = controller.submit()(request)

        status(result) shouldBe SEE_OTHER
        redirectLocation(result) shouldBe Some("/email/error")
      }
    }
  }
}
