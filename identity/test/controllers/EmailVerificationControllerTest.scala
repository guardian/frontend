package controllers

import actions.AuthenticatedActions
import com.gu.identity.model.{StatusFields, User}
import idapiclient.{IdApiClient, ScGuU, TrackingData}
import model.PhoneNumbers
import org.mockito.AdditionalAnswers.returnsFirstArg
import org.mockito.ArgumentMatchers.{any, anyString}
import org.mockito.Mockito._
import org.scalatest.freespec.PathAnyFreeSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.mvc.{ControllerComponents, Request, RequestHeader}
import play.api.test.Helpers._
import services._
import test._

import scala.concurrent.Future

class EmailVerificationControllerTest
    extends PathAnyFreeSpec
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
  val newsletterService = spy(new NewsletterService(api))

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
  )

  val EmailValidatedMessage = "Your email address has been validated."
  when(identityUrlBuilder.buildUrl(anyString(), any[(String, String)]())) thenAnswer returnsFirstArg()
  when(idRequestParser.apply(any[Request[_]])) thenReturn idRequest
  when(returnUrlVerifier.getVerifiedReturnUrl(any[Request[_]])).thenReturn(Some("http://www.theguardian.com/football"))

  val controller = new EmailVerificationController(
    api,
    identityUrlBuilder,
    returnUrlVerifier,
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
