package controllers

import actions.AuthenticatedActions
import com.gu.identity.model._
import form._
import idapiclient.{TrackingData, _}
import model.PhoneNumbers
import controllers.editprofile.EditProfileController
import org.mockito.Mockito._
import org.mockito.{Matchers => MockitoMatchers}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{DoNotDiscover, OptionValues}
import org.scalatestplus.play.ConfiguredServer
import _root_.play.api.http.HttpConfiguration
import _root_.play.api.mvc._
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.mockito.MockitoSugar
import services._
import services.newsletters.NewsletterSignupAgent
import test._

import scala.concurrent.Future

//TODO test form validation and population of form fields.
@DoNotDiscover class EditProfileControllerTest
    extends AnyWordSpec
    with WithTestExecutionContext
    with Matchers
    with MockitoSugar
    with OptionValues
    with ScalaFutures
    with WithTestApplicationContext
    with WithTestCSRF
    with ConfiguredServer {

  trait EditProfileFixture {

    val controllerComponent: ControllerComponents = _root_.play.api.test.Helpers.stubControllerComponents()
    val idUrlBuilder: IdentityUrlBuilder = mock[IdentityUrlBuilder]
    val api: IdApiClient = mock[IdApiClient]
    val idRequestParser: IdRequestParser = mock[IdRequestParser]
    val authService: AuthenticationService = mock[AuthenticationService]
    val idRequest: IdentityRequest = mock[IdentityRequest]
    val trackingData: TrackingData = mock[TrackingData]
    val returnUrlVerifier: ReturnUrlVerifier = mock[ReturnUrlVerifier]
    val newsletterService: NewsletterService = spy(new NewsletterService(api))
    val httpConfiguration: HttpConfiguration = HttpConfiguration.createWithDefaults()
    val newsletterSignupAgent: NewsletterSignupAgent = mock[NewsletterSignupAgent]

    val userId: String = "123"
    val user: User = User("test@example.com", userId, statusFields = StatusFields(userEmailValidated = Some(true)))
    val testAuth: ScGuU = ScGuU("abc")
    val authenticatedUser: AuthenticatedUser = AuthenticatedUser(user, testAuth, true)
    val phoneNumbers = PhoneNumbers

    val authenticatedActions = new AuthenticatedActions(
      authService,
      api,
      mock[IdentityUrlBuilder],
      controllerComponent,
      newsletterService,
      idRequestParser,
    )
    val signinService: PlaySigninService = mock[PlaySigninService]
    val profileFormsMapping: ProfileFormsMapping = ProfileFormsMapping(
      new PrivacyMapping,
    )

    when(authService.fullyAuthenticatedUser(MockitoMatchers.any[RequestHeader])) thenReturn Some(authenticatedUser)
    when(api.me(testAuth)) thenReturn Future.successful(Right(user))

    when(idRequestParser.apply(MockitoMatchers.any[RequestHeader])) thenReturn idRequest
    when(idRequest.trackingData) thenReturn trackingData
    when(idRequest.returnUrl) thenReturn None
    when(newsletterSignupAgent.getNewsletters()) thenReturn Right(Nil)

    when(api.userEmails(MockitoMatchers.anyString(), MockitoMatchers.any[TrackingData])) thenReturn Future.successful(
      Right(Subscriber("Text", List(EmailList("37")), "subscribed")),
    )

    lazy val controller = new EditProfileController(
      idUrlBuilder,
      authenticatedActions,
      api,
      idRequestParser,
      csrfCheck,
      csrfAddToken,
      returnUrlVerifier,
      newsletterService,
      signinService,
      newsletterSignupAgent,
      profileFormsMapping,
      testApplicationContext,
      httpConfiguration,
      controllerComponent,
    )
  }
}
