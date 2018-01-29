package controllers

import actions.AuthenticatedActions
import idapiclient.responses.Error
import idapiclient.{IdApiClient, TrackingData}
import org.mockito.AdditionalAnswers.returnsFirstArg
import org.mockito.Matchers.{any, anyString, anyVararg, eq => eql}
import org.mockito.Mockito._
import org.mockito.{Matchers => MockitoMatchers}
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{Matchers, path}
import play.api.mvc.{ControllerComponents, Request}
import play.api.test.Helpers._
import services._
import test.{Fake, TestRequest, WithTestApplicationContext, WithTestIdConfig}

import scala.concurrent.Future

class EmailVerificationControllerTest extends path.FreeSpec
  with Matchers
  with WithTestApplicationContext
  with MockitoSugar
  with WithTestIdConfig {

  val controllerComponent: ControllerComponents = play.api.test.Helpers.stubControllerComponents()
  val api = mock[IdApiClient]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val idRequestParser = mock[IdRequestParser]
  val authenticationService = mock[AuthenticationService]
  val identityUrlBuilder = mock[IdentityUrlBuilder]
  val testRequest = TestRequest()
  val authService = mock[AuthenticationService]
  val trackingData = mock[TrackingData]
  val idRequest = mock[IdentityRequest]
  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val newsletterService = spy(new NewsletterService(api, idRequestParser, idUrlBuilder))

  val redirectDecisionService = new ProfileRedirectService(newsletterService, idRequestParser, controllerComponent)
  val authenticatedActions = new AuthenticatedActions(authService, api, mock[IdentityUrlBuilder], controllerComponent, newsletterService, idRequestParser, redirectDecisionService)

  val EmailValidatedMessage = "Your email address has been validated."
  when(identityUrlBuilder.buildUrl(anyString(), anyVararg[(String, String)]())) thenAnswer returnsFirstArg()
  when(idRequestParser.apply(testRequest)) thenReturn idRequest
  when(authenticationService.userIsFullyAuthenticated(MockitoMatchers.any[Request[_]])) thenReturn true
  when(returnUrlVerifier.getVerifiedReturnUrl(MockitoMatchers.any[Request[_]])).thenReturn(Some("http://www.theguardian.com/football"))

  val controller = new EmailVerificationController(
    api,
    authenticatedActions,
    authenticationService,
    idRequestParser,
    identityUrlBuilder,
    returnUrlVerifier,
    play.api.test.Helpers.stubControllerComponents()
  )(testApplicationContext)

  "Given the plain verify method is called" - Fake {

    "should not render a link if it's not a sign up" in {
      val result = controller.resendEmailValidationEmail(true, false, None)(testRequest)
      contentAsString(result) should include("Confirm your email address")
      contentAsString(result) should not include("Exit and go to The Guardian home page")
    }

    "should render a link if it's a sign up" in {
      val result = controller.resendEmailValidationEmail(true, true, None)(testRequest)
      contentAsString(result) should include("Confirm your email address")
      contentAsString(result) should include("Exit and go to The Guardian home page")
    }

    "should link to the return url" in {
      val result = controller.resendEmailValidationEmail(true, true, Some("https://jobs.theguardian.com/test-string-test"))(testRequest)
      contentAsString(result) should include("Confirm your email address")
      contentAsString(result) should include("test-string-test")
      contentAsString(result) should include("Exit and continue")
    }
  }

  "Given the verify method is called" - Fake {
    val token = "myToken"

    "when the api call succeeds" - {
      when(api.validateEmail(eql(token), any())).thenReturn(Future.successful(Right(())))
      val result = controller.verify(token)(testRequest)

      "should redirect to default consent journey" in {
        status(result) should be(SEE_OTHER)
        redirectLocation(result).get should include("/consents?")
      }
    }

    "when the api call returns already validated error" - {
      val err = Error("User Already Validated", "This user account has already been validated")
      when(api.validateEmail(eql(token), any())).thenReturn(Future.successful(Left(List(err))))
      val result = controller.verify(token)(testRequest)

      "should redirect to default consent journey" in {
        status(result) should be(SEE_OTHER)
        redirectLocation(result).get should include("/consents?")
      }
    }

    "when the api call returns token expired error" - {
      val err = Error("Token expired", "The activation token is no longer valid")
      when(api.validateEmail(eql(token), any())).thenReturn(Future.successful(Left(List(err))))
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
      when(api.validateEmail(eql(token), any())).thenReturn(Future.successful(Left(List(err))))
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
