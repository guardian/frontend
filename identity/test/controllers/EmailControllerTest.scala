package controllers

import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.cookie.GuUCookieData
import org.scalatest.{DoNotDiscover, Matchers, WordSpec}
import services._
import services.{IdRequestParser, IdentityUrlBuilder, ReturnUrlVerifier}
import idapiclient.{IdApiClient, ScGuU}
import conf.{FrontendIdentityCookieDecoder, IdentityConfiguration}
import org.scalatest.mockito.MockitoSugar
import test._
import play.api.mvc.RequestHeader

import scala.concurrent.Future
import com.gu.identity.model.User
import org.mockito.Mockito._
import org.mockito.{Matchers => MockitoMatchers}
import play.api.test.Helpers._
import com.gu.identity.model.Subscriber
import services.IdentityRequest
import client.{Auth, Error}
import idapiclient.TrackingData
import actions.AuthenticatedActions

@DoNotDiscover class EmailControllerTest extends WordSpec
  with Matchers
  with MockitoSugar
  with WithTestApplicationContext
  with WithTestCSRF
  with ConfiguredTestSuite {

  val controllerComponents = play.api.test.Helpers.stubControllerComponents()

  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val conf = mock[IdentityConfiguration]
  val api = mock[IdApiClient]
  val idRequestParser = mock[IdRequestParser]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val authService = mock[AuthenticationService]
  val cookieDecoder = mock[FrontendIdentityCookieDecoder]
  val idRequest = mock[IdentityRequest]
  val trackingData = mock[TrackingData]

  val userId = "123"
  val user = User("test@example.com", userId)
  val testAuth = ScGuU("abc", GuUCookieData(user, 0, None))
  val authenticatedUser = AuthenticatedUser(user, testAuth)
  val error = Error("Test message", "Test description", 500)
  val errors = List(error)

  val authenticatedActions  = new AuthenticatedActions(authService, api, mock[IdentityUrlBuilder], controllerComponents)

  when(authService.authenticatedUserFor(MockitoMatchers.any[RequestHeader])) thenReturn Some(AuthenticatedUser(user, testAuth))

  when(idRequestParser.apply(MockitoMatchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData

  when(idUrlBuilder.buildUrl(MockitoMatchers.any[String], MockitoMatchers.any[IdentityRequest], MockitoMatchers.any[(String, String)])) thenReturn "/email-prefs"
  lazy val emailController = new EmailController(
    returnUrlVerifier,
    conf,
    api,
    idRequestParser,
    idUrlBuilder,
    authenticatedActions,
    csrfCheck,
    csrfAddToken,
    controllerComponents
  )

  "The preferences method" when {
    val testRequest = TestRequest()
    val authRequest = new AuthRequest(authenticatedUser, testRequest)

    "the api calls succeed" should {
      val subscriber = Subscriber("Text", Nil)
      when(api.userEmails(MockitoMatchers.anyString(), MockitoMatchers.any[TrackingData])) thenReturn Future.successful(Right(subscriber))

      "display form" in {
        val result = emailController.preferences()(authRequest)
        status(result) should equal(OK)
        val content = contentAsString(result)
        content should include("addEmailSubscription")
      }
    }

    "the API calls fail" should {
      when(api.userEmails(MockitoMatchers.anyString(), MockitoMatchers.any[TrackingData])) thenReturn Future.successful(Left(List(error)))

      "include the error message on the page" in {
        val result = emailController.preferences()(authRequest)
        contentAsString(result).contains(error.description) should equal(true)
      }
    }
  }

  "The save preferences method" when {
    "the form submission is valid" when {
      val emailFormat = "Text"
      def fakeRequest = FakeCSRFRequest(csrfAddToken,POST, "/email-prefs")
        .withFormUrlEncodedBody("htmlPreference" -> emailFormat, "csrfToken" -> "abc")
      def authRequest = new AuthRequest(authenticatedUser, fakeRequest)

      "api call is successful" should {
        // Crazy Unit return type!
        when(api.updateUserEmails(MockitoMatchers.anyString(), MockitoMatchers.any[Subscriber], MockitoMatchers.any[Auth], MockitoMatchers.any[TrackingData])) thenReturn Future.successful(Right(()))

        "call updateUser and updateUserEmails" in {
          emailController.savePreferences()(authRequest)
          verify(api).updateUserEmails(userId, Subscriber(emailFormat, Nil), testAuth, trackingData)
        }
      }

      "user email API call failed" should {
        when(api.updateUserEmails(MockitoMatchers.anyString(), MockitoMatchers.any[Subscriber], MockitoMatchers.any[Auth], MockitoMatchers.any[TrackingData])) thenReturn Future.successful(Left(errors))

        "include the error message on the page" in {
          val result = emailController.savePreferences()(authRequest)
          contentAsString(result)
          val content = contentAsString(result)
          content should include("There was an error saving your preferences")
        }
      }
    }
  }
}
