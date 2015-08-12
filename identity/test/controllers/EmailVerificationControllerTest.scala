package controllers

import org.scalatest.{ShouldMatchers, path}
import services._
import idapiclient.IdApiClient
import org.scalatest.mock.MockitoSugar
import test.{TestRequest, Fake}
import play.api.mvc.{Request, RequestHeader}
import scala.concurrent.Future
import org.mockito.Mockito._
import org.mockito.Matchers
import play.api.test.Helpers._
import idapiclient.TrackingData
import client.Error
import actions.AuthenticatedActions

class EmailVerificationControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  val api = mock[IdApiClient]
  val idRequestParser = mock[IdRequestParser]
  val authenticatedActions = mock[AuthenticatedActions]
  val authenticationService = mock[AuthenticationService]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val idRequest = mock[IdentityRequest]
  val trackingData = mock[TrackingData]
  val returnUrlVerifier = mock[ReturnUrlVerifier]

  val EmailValidatedMessage = "Your email address has been validated."

  when(idRequestParser.apply(Matchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData
  when(authenticationService.requestPresentsAuthenticationCredentials(Matchers.any[Request[_]])) thenReturn true
  when(returnUrlVerifier.getVerifiedReturnUrl(Matchers.any[Request[_]])).thenReturn(Some("http://www.theguardian.com/football"))

  val controller = new EmailVerificationController(api, authenticatedActions, authenticationService, idRequestParser, idUrlBuilder, returnUrlVerifier)

  "Given the verify method is called" - Fake {
    val testRequest = TestRequest()
    val token = "myToken"

    "when the api call succeeds" - {
      when(api.validateEmail(token, trackingData)).thenReturn(Future.successful(Right(())))
      val result = controller.verify(token)(testRequest)

      "should display the validation completed page" in {
        status(result) should be(OK)
        contentAsString(result) should include(EmailValidatedMessage)
        contentAsString(result) should not include("Your email confirmation link has expired")
        contentAsString(result) should not include("Sorry, this email confirmation link is not recognised.")
        contentAsString(result) should not include("Resend my verification email")
      }
    }

    "when the api call returns already validated error" - {
      val err = Error("User Already Validated", "This user account has already been validated")
      when(api.validateEmail(token, trackingData)).thenReturn(Future.successful(Left(List(err))))
      val result = controller.verify(token)(testRequest)

      "should display the validation completed page" in {
        status(result) should be(OK)
        contentAsString(result) should include(EmailValidatedMessage)
        contentAsString(result) should not include("Your email confirmation link has expired")
        contentAsString(result) should not include("Sorry, this email confirmation link is not recognised.")
        contentAsString(result) should not include("Resend my verification email")
      }
    }

    "when the api call returns token expired error" - {
      val err = Error("Token expired", "The activation token is no longer valid")
      when(api.validateEmail(token, trackingData)).thenReturn(Future.successful(Left(List(err))))
      val result = controller.verify(token)(testRequest)

      "should display the validation completed page" in {
        status(result) should be(OK)
        contentAsString(result) should include("Your email confirmation link has expired")
        contentAsString(result) should include("Resend my verification email")
        contentAsString(result) should not include(EmailValidatedMessage)
        contentAsString(result) should not include("Sorry, this email confirmation link is not recognised.")
      }
    }

    "when the api call returns invalid token error" - {
      val err = Error("Invalid json", "This request contains invalid json")
      when(api.validateEmail(token, trackingData)).thenReturn(Future.successful(Left(List(err))))
      val result = controller.verify(token)(testRequest)

      "should display the validation completed page" in {
        status(result) should be(OK)
        contentAsString(result) should include("Sorry, this email confirmation link is not recognised.")
        contentAsString(result) should include("Resend my verification email")
        contentAsString(result) should not include(EmailValidatedMessage)
        contentAsString(result) should not include("Your email confirmation link has expired")
      }
    }

  }
}
