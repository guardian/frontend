package controllers

import actions.AuthenticatedActions
import com.gu.identity.model.{StatusFields, User}
import idapiclient.{IdApiClient, ScGuU, TrackingData}
import model.PhoneNumbers
import org.mockito.AdditionalAnswers.returnsFirstArg
import org.mockito.Matchers.{any, anyString, anyVararg}
import org.mockito.Mockito._
import org.scalatest.freespec.PathAnyFreeSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.mvc.{ControllerComponents, Request, RequestHeader}
import play.api.test.Helpers._
import services._
import test._

import scala.concurrent.Future
import play.api.mvc.AnyContentAsEmpty
import play.api.test.FakeRequest

class EmailVerificationControllerTest
    extends PathAnyFreeSpec
    with Matchers
    with WithTestExecutionContext
    with WithTestApplicationContext
    with MockitoSugar
    with WithTestIdConfig {

  val controllerComponent: ControllerComponents = play.api.test.Helpers.stubControllerComponents()
  val api: IdApiClient = mock[IdApiClient]
  val idUrlBuilder: IdentityUrlBuilder = mock[IdentityUrlBuilder]
  val idRequestParser: IdRequestParser = mock[IdRequestParser]
  val authenticationService: AuthenticationService = mock[AuthenticationService]
  val identityUrlBuilder: IdentityUrlBuilder = mock[IdentityUrlBuilder]
  val testRequest: FakeRequest[AnyContentAsEmpty.type] = TestRequest()
  val authService: AuthenticationService = mock[AuthenticationService]
  val trackingData: TrackingData = mock[TrackingData]
  val idRequest: IdentityRequest = mock[IdentityRequest]
  val returnUrlVerifier: ReturnUrlVerifier = mock[ReturnUrlVerifier]
  val signinService: PlaySigninService = mock[PlaySigninService]
  val newsletterService: NewsletterService = spy(new NewsletterService(api))

  val userId: String = "123"
  val user: User = User("test@example.com", userId, statusFields = StatusFields(userEmailValidated = Some(true)))
  val testAuth: ScGuU = ScGuU("abc")
  val authenticatedUser: AuthenticatedUser = AuthenticatedUser(user, testAuth, true)
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
