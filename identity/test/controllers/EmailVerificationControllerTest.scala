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

class EmailVerificationControllerTest
    extends path.FreeSpec
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

  val userId: String = "123"
  val user = User("test@example.com", userId, statusFields = StatusFields(userEmailValidated = Some(true)))
  val testAuth = ScGuU("abc")
  val authenticatedUser = AuthenticatedUser(user, testAuth, true)
  val phoneNumbers = PhoneNumbers

  when(authService.fullyAuthenticatedUser(any[RequestHeader])) thenReturn Some(authenticatedUser)
  when(api.me(testAuth)) thenReturn Future.successful(Right(user))

  val authenticatedActions = new AuthenticatedActions(
    authService,
    api,
    mock[IdentityUrlBuilder],
    controllerComponent,
    newsletterService,
    idRequestParser,
  )

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
    play.api.test.Helpers.stubControllerComponents(),
  )(testApplicationContext)

  "Given resendEmailValidationEmail is called" - Fake {

    "Given completeRegistration is called" - Fake {

      "should render the proper view" in {
        when(returnUrlVerifier.getVerifiedReturnUrl(any[Request[_]])).thenReturn(None)
        when(api.decryptEmailToken(anyString())).thenReturn(Future.successful(Right("an email address")))
        val result = controller.completeRegistration()(TestRequest("/foo?encryptedEmail=someEncryptedString"))
        contentAsString(result) should include("Please verify your email to complete your registration")
      }

      "should link to the return url if encrypted email parameter is not present" in {
        when(returnUrlVerifier.getVerifiedReturnUrl(any[Request[_]]))
          .thenReturn(Some("https://jobs.theguardian.com/test-string-test"))
        val result = controller.completeRegistration()(testRequest)
        contentAsString(result) should include("test-string-test")
        contentAsString(result) should include("Exit and continue to The Guardian")
      }
    }
  }

}
