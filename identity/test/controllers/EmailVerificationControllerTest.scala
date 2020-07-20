package controllers

import actions.AuthenticatedActions
import com.gu.identity.model.{StatusFields, User}
import idapiclient.responses.{CookieResponse, CookiesResponse, Error}
import idapiclient.{Auth, IdApiClient, ScGuU, TrackingData}
import model.PhoneNumbers
import org.joda.time.DateTime
import org.mockito.AdditionalAnswers.returnsFirstArg
import org.mockito.Matchers.{any, anyString, anyVararg, eq => eql}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{Matchers, path}
import play.api.mvc.{ControllerComponents, Cookie, Request, RequestHeader}
import play.api.test.Helpers._
import services._
import test._

import scala.concurrent.Future

class EmailVerificationControllerTest extends path.FreeSpec
  with Matchers
  with WithTestExecutionContext
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
  val signinService = mock[PlaySigninService]
  val newsletterService = spy(new NewsletterService(api, idRequestParser, idUrlBuilder))

  when(api.resendEmailValidationEmail(any[Auth], any[TrackingData], any[Option[String]])) thenReturn Future.successful(Right({}))

  val userId: String = "123"
  val user = User("test@example.com", userId, statusFields = StatusFields(userEmailValidated = Some(true)))
  val testAuth = ScGuU("abc")
  val authenticatedUser = AuthenticatedUser(user, testAuth, true)
  val phoneNumbers = PhoneNumbers

  when(authService.fullyAuthenticatedUser(any[RequestHeader])) thenReturn Some(authenticatedUser)
  when(api.me(testAuth)) thenReturn Future.successful(Right(user))

  val authenticatedActions = new AuthenticatedActions(authService, api, mock[IdentityUrlBuilder], controllerComponent, newsletterService, idRequestParser)

  val EmailValidatedMessage = "Your email address has been validated."
  when(identityUrlBuilder.buildUrl(anyString(), anyVararg[(String, String)]())) thenAnswer returnsFirstArg()
  when(idRequestParser.apply(any[Request[_]])) thenReturn idRequest
  when(authenticationService.userIsFullyAuthenticated(any[Request[_]])) thenReturn true
  when(returnUrlVerifier.getVerifiedReturnUrl(any[Request[_]])).thenReturn(Some("http://www.theguardian.com/football"))

  val controller = new EmailVerificationController(
    api,
    authenticatedActions,
    authenticationService,
    idRequestParser,
    identityUrlBuilder,
    returnUrlVerifier,
    signinService,
    play.api.test.Helpers.stubControllerComponents()
  )(testApplicationContext)

  "Given resendEmailValidationEmail is called" - Fake {

    "should render the proper view" in {
      when(returnUrlVerifier.getVerifiedReturnUrl(any[Request[_]])).thenReturn(None)
      val result = controller.resendEmailValidationEmail()(testRequest)
      contentAsString(result) should include("you must confirm this is your email address")
      contentAsString(result) should not include ("Exit and go to The Guardian home page")
    }

  }

  "Given completeRegistration is called" - Fake {

    "should render the proper view" in {
      when(returnUrlVerifier.getVerifiedReturnUrl(any[Request[_]])).thenReturn(None)
      val result = controller.completeRegistration()(testRequest)
      contentAsString(result) should include("Please check your inbox")
      contentAsString(result) should include("Exit and go to The Guardian home page")
    }

    "should link to the return url" in {
      when(returnUrlVerifier.getVerifiedReturnUrl(any[Request[_]])).thenReturn(Some("https://jobs.theguardian.com/test-string-test"))
      val result = controller.completeRegistration()(testRequest)
      contentAsString(result) should include("test-string-test")
      contentAsString(result) should include("Exit and continue")
    }
  }

  "Given the verify method is called" - Fake {
    val token = "myToken"

    "when the api call succeeds" - {
      val expiry = new DateTime(1595243635000L)
      val cookieResponse = CookiesResponse(expiry, List(CookieResponse("key", "value")))
      val playCookie = Cookie("key", "value")
      when(api.validateEmail(eql(token), any())).thenReturn(Future.successful(Right(cookieResponse)))

      "should redirect to default consent journey" in {
        reset(signinService)
        when(signinService.getCookies(cookieResponse, rememberMe = true)).thenReturn(List(playCookie))
        val result = controller.verify(token)(testRequest)
        status(result) should be(SEE_OTHER)
        redirectLocation(result).get should include("/consents?")
        cookies(result).get("key").get.value shouldBe "value"
      }

      "should redirect to original returnUrl if it was already a consent journey" in {
        reset(signinService)
        when(signinService.getCookies(cookieResponse, rememberMe = true)).thenReturn(List(playCookie))
        when(returnUrlVerifier.getVerifiedReturnUrl(any[Request[_]])).thenReturn(Some("https://profile.theguardian.com/consents"))
        val result = controller.verify(token)(testRequest)
        status(result) should be(SEE_OTHER)
        redirectLocation(result).get should include("/consents")
        cookies(result).get("key").get.value shouldBe "value"
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
