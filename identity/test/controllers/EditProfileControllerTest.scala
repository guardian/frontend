package controllers

import actions.AuthenticatedActions
import com.gu.identity.cookie.GuUCookieData
import com.gu.identity.model.Consent.Supporter
import com.gu.identity.model._
import form._
import idapiclient.{TrackingData, _}
import idapiclient.Auth
import idapiclient.responses.Error
import model.{Countries, PhoneNumbers}
import com.gu.identity.model.EmailNewsletters
import controllers.editprofile.EditProfileController
import org.joda.time.format.ISODateTimeFormat
import org.mockito.Mockito._
import org.mockito.{ArgumentCaptor, Matchers => MockitoMatchers}
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{DoNotDiscover, Matchers, OptionValues, WordSpec}
import org.scalatest.mockito.MockitoSugar
import org.scalatestplus.play.ConfiguredServer
import _root_.play.api.http.HttpConfiguration
import _root_.play.api.mvc._
import _root_.play.api.test.FakeRequest
import _root_.play.api.test.Helpers._
import services._
import test._
import scala.concurrent.Future

//TODO test form validation and population of form fields.
@DoNotDiscover class EditProfileControllerTest
    extends WordSpec
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
    val idUrlBuilder = mock[IdentityUrlBuilder]
    val api = mock[IdApiClient]
    val idRequestParser = mock[IdRequestParser]
    val authService = mock[AuthenticationService]
    val idRequest = mock[IdentityRequest]
    val trackingData = mock[TrackingData]
    val returnUrlVerifier = mock[ReturnUrlVerifier]
    val newsletterService = spy(new NewsletterService(api, idRequestParser, idUrlBuilder))
    val httpConfiguration = HttpConfiguration.createWithDefaults()

    val userId: String = "123"
    val user = User("test@example.com", userId, statusFields = StatusFields(userEmailValidated = Some(true)))
    val testAuth = ScGuU("abc")
    val authenticatedUser = AuthenticatedUser(user, testAuth, true)
    val phoneNumbers = PhoneNumbers

    val authenticatedActions = new AuthenticatedActions(
      authService,
      api,
      mock[IdentityUrlBuilder],
      controllerComponent,
      newsletterService,
      idRequestParser,
    )
    val signinService = mock[PlaySigninService]
    val profileFormsMapping = ProfileFormsMapping(
      new AccountDetailsMapping,
      new PrivacyMapping,
      new ProfileMapping,
    )

    when(authService.fullyAuthenticatedUser(MockitoMatchers.any[RequestHeader])) thenReturn Some(authenticatedUser)
    when(api.me(testAuth)) thenReturn Future.successful(Right(user))

    when(idRequestParser.apply(MockitoMatchers.any[RequestHeader])) thenReturn idRequest
    when(idRequest.trackingData) thenReturn trackingData
    when(idRequest.returnUrl) thenReturn None

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
      profileFormsMapping,
      testApplicationContext,
      httpConfiguration,
      controllerComponent,
    )
  }
}
