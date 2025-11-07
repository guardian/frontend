package controllers

import actions.AuthenticatedActions
import com.gu.identity.model.Consent.Supporter
import com.gu.identity.model._
import controllers.editprofile.EditProfileController
import form._
import idapiclient.{Auth, TrackingData, _}
import model.PhoneNumbers
import org.mockito.Mockito._
import org.mockito.Mockito.{when, verify}
import org.mockito.{ArgumentCaptor, ArgumentMatchers => MockitoMatchers}
import MockitoMatchers._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest._
import org.scalatestplus.play.ConfiguredServer
import _root_.play.api.http.HttpConfiguration
import _root_.play.api.mvc._
import _root_.play.api.test.Helpers._
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.mockito.MockitoSugar
import services._
import services.newsletters.NewsletterSignupAgent
import test._

import scala.concurrent.Future

@DoNotDiscover class ConsentsJourneyControllerTest
    extends AnyWordSpec
    with WithTestExecutionContext
    with Matchers
    with MockitoSugar
    with OptionValues
    with ScalaFutures
    with WithTestApplicationContext
    with WithTestCSRF
    with ConfiguredServer {

  trait ConsentsJourneyFixture {

    val controllerComponent: ControllerComponents = stubControllerComponents()
    val idUrlBuilder = mock[IdentityUrlBuilder]
    val api = mock[IdApiClient]
    val idRequestParser = mock[IdRequestParser]
    val authService = mock[AuthenticationService]
    val idRequest = mock[IdentityRequest]
    val trackingData = mock[TrackingData]
    val returnUrlVerifier = mock[ReturnUrlVerifier]
    val newsletterService = spy(new NewsletterService(api))
    val httpConfiguration = HttpConfiguration.createWithDefaults()
    val newsletterSignupAgent = mock[NewsletterSignupAgent]

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
      new PrivacyMapping,
    )

    when(authService.fullyAuthenticatedUser(any[RequestHeader])) thenReturn Some(authenticatedUser)
    when(api.me(testAuth)) thenReturn Future.successful(Right(user))

    when(idRequest.trackingData) thenReturn trackingData
    when(idRequest.returnUrl) thenReturn None
    when(idRequestParser.apply(any[RequestHeader])) thenReturn idRequest

    when(returnUrlVerifier.defaultReturnUrl) thenReturn "http://1234.67"
    when(returnUrlVerifier.getVerifiedReturnUrl(any[RequestHeader])) thenReturn None
    when(api.userEmails(anyString(), any[TrackingData])) thenReturn Future.successful(
      Right(Subscriber("Text", List(EmailList("37")), "subscribed")),
    )
    when(newsletterSignupAgent.getNewsletters()) thenReturn Right(Nil)

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

  "ConsentsJourney" when {

    "using any journey" should {

      "update Identity user on submit" in new ConsentsJourneyFixture {
        val fakeRequest = FakeCSRFRequest(csrfAddToken)
          .withFormUrlEncodedBody(
            "returnUrl" -> returnUrlVerifier.defaultReturnUrl,
          )

        when(api.saveUser(any[String], any[UserUpdateDTO], any[Auth]))
          .thenReturn(Future.successful(Right(user)))

        val result = controller.completeConsents.apply(fakeRequest)
        status(result) should be(303)

        val userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdateDTO])
        verify(api).saveUser(MockitoMatchers.eq(userId), userUpdateCapture.capture(), MockitoMatchers.eq(testAuth))
      }

    }

    "using displayConsentsJourneyThankYou" should {

      "thank you" in new ConsentsJourneyFixture {
        val result = controller.displayConsentsJourneyThankYou().apply(FakeCSRFRequest(csrfAddToken))
        status(result) should be(200)
        contentAsString(result) should include("form__success")
        contentAsString(result) should include("Thank you")
      }

      "have consent checkboxes" in new ConsentsJourneyFixture {
        val result = controller.displayConsentsJourneyThankYou().apply(FakeCSRFRequest(csrfAddToken))
        status(result) should be(200)
        contentAsString(result) should include(xml.Utility.escape(Supporter.latestWording.wording))
      }

    }

  }
}
