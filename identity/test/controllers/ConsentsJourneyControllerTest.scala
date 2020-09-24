package controllers

import actions.AuthenticatedActions
import com.gu.identity.cookie.GuUCookieData
import com.gu.identity.model.Consent.Supporter
import com.gu.identity.model.{EmailNewsletters, _}
import controllers.editprofile.EditProfileController
import form._
import idapiclient.{Auth, TrackingData, _}
import model.{Countries, PhoneNumbers}
import org.mockito.Mockito._
import org.mockito.{ArgumentCaptor, Matchers => MockitoMatchers}
import MockitoMatchers._
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.mockito.MockitoSugar
import org.scalatest._
import org.scalatestplus.play.ConfiguredServer
import _root_.play.api.http.HttpConfiguration
import _root_.play.api.mvc._
import _root_.play.api.test.Helpers._
import services._
import test._

import scala.concurrent.Future

@DoNotDiscover class ConsentsJourneyControllerTest
    extends WordSpec
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

  "ConsentsJourney" when {

    "using any journey" should {

      "have a js fallback" in new ConsentsJourneyFixture {
        val result = controller.displayConsentsJourney(None).apply(FakeCSRFRequest(csrfAddToken))
        status(result) should be(200)
        contentAsString(result) should include("consents : navigation : submit-force")
        contentAsString(result) should include("noscript")
        contentAsString(result) should include("identity-forms-loading--hide-text")
      }

      "send a csrf token and a return url" in new ConsentsJourneyFixture {
        val result = controller.displayConsentsJourney(None).apply(FakeCSRFRequest(csrfAddToken))
        status(result) should be(200)
        contentAsString(result) should include("name=\"csrfToken\"")
        contentAsString(result) should include("name=\"returnUrl\"")
      }

      "have a normal submit button" in new ConsentsJourneyFixture {
        val result = controller.displayConsentsJourney(None).apply(FakeCSRFRequest(csrfAddToken))
        status(result) should be(200)
        contentAsString(result) should include("consents : navigation : submit\"")
      }

      "contain the legal age disclaimer" in new ConsentsJourneyFixture {
        val result = controller.displayConsentsJourney(None).apply(FakeCSRFRequest(csrfAddToken))
        status(result) should be(200)
        contentAsString(result) should include("older than 13 years")
      }

      "show an alert modal for non rp'd users" in new ConsentsJourneyFixture {
        val result = controller.displayConsentsJourney(None).apply(FakeCSRFRequest(csrfAddToken))
        status(result) should be(200)
        contentAsString(result) should include("identity-consent-journey--with-alert")
      }

      "not show an alert modal for rp'd users" in new ConsentsJourneyFixture {
        override val user = User(
          "test@example.com",
          userId,
          statusFields = StatusFields(userEmailValidated = Some(true), hasRepermissioned = Some(true)),
        )
        override val testAuth = ScGuU("abc")
        override val authenticatedUser = AuthenticatedUser(user, testAuth, true)
        when(authService.fullyAuthenticatedUser(MockitoMatchers.any[RequestHeader])) thenReturn Some(authenticatedUser)
        when(api.me(testAuth)) thenReturn Future.successful(Right(user))

        val result = controller.displayConsentsJourney(None).apply(FakeCSRFRequest(csrfAddToken))
        status(result) should be(200)
        contentAsString(result) should not include ("identity-consent-journey--with-alert")
      }

      "set a repermission flag on submit" in new ConsentsJourneyFixture {
        val updatedUser = user.copy(
          statusFields = StatusFields(hasRepermissioned = Some(true)),
        )

        val fakeRequest = FakeCSRFRequest(csrfAddToken)
          .withFormUrlEncodedBody(
            "returnUrl" -> returnUrlVerifier.defaultReturnUrl,
          )

        when(api.saveUser(any[String], any[UserUpdateDTO], any[Auth]))
          .thenReturn(Future.successful(Right(updatedUser)))

        val result = controller.submitRepermissionedFlag.apply(fakeRequest)
        status(result) should be(303)

        val userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdateDTO])
        verify(api).saveUser(MockitoMatchers.eq(userId), userUpdateCapture.capture(), MockitoMatchers.eq(testAuth))
        val userUpdate = userUpdateCapture.getValue
        userUpdate.statusFields.get.hasRepermissioned should equal(Some(true))
      }

    }

    "using displayConsentsJourney" should {

      "have consent checkboxes" in new ConsentsJourneyFixture {
        val result = controller.displayConsentsJourney(None).apply(FakeCSRFRequest(csrfAddToken))
        status(result) should be(200)
        contentAsString(result) should include(xml.Utility.escape(Supporter.latestWording.wording))
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
