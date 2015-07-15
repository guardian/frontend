package controllers

import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.cookie.GuUCookieData
import org.mockito.Matchers
import org.scalatest.{ShouldMatchers, path}
import services._
import services.{ReturnUrlVerifier, IdRequestParser, IdentityUrlBuilder}
import idapiclient.{ScGuU, IdApiClient}
import conf.{FrontendIdentityCookieDecoder, IdentityConfiguration}
import org.scalatest.mock.MockitoSugar
import test.{FakeCSRFRequest, TestRequest, Fake}
import play.api.mvc.{RequestHeader, Request, Result}
import scala.concurrent.Future
import com.gu.identity.model.{StatusFields, User}
import org.mockito.Mockito._
import org.mockito.Matchers.{any, anyString}
import play.api.test.Helpers._
import play.api.test.FakeRequest
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonDSL._
import com.gu.identity.model.Subscriber
import services.IdentityRequest
import client.{Auth, Error}
import idapiclient.TrackingData
import actions.AuthenticatedActions
import play.api.i18n.Messages.Implicits.applicationMessagesApi
import play.api.Play.current

class EmailControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
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
  val user = User("test@example.com", userId, statusFields = StatusFields(receive3rdPartyMarketing = None, receiveGnmMarketing = None))
  val testAuth = ScGuU("abc", GuUCookieData(user, 0, None))
  val authenticatedUser = AuthenticatedUser(user, testAuth)
  val error = Error("Test message", "Test description", 500)
  val errors = List(error)

  val authenticatedActions  = new AuthenticatedActions(authService, api, mock[IdentityUrlBuilder])

  when(authService.authenticatedUserFor(Matchers.any[RequestHeader])) thenReturn Some(AuthenticatedUser(user, testAuth))

  when(idRequestParser.apply(any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData

  when(idUrlBuilder.buildUrl(any[String], any[IdentityRequest], any[(String, String)])) thenReturn "/email-prefs"
  lazy val emailController = new EmailController(returnUrlVerifier, conf, api, idRequestParser, idUrlBuilder, authenticatedActions, applicationMessagesApi)

  "The preferences method" - Fake {
    val testRequest = TestRequest()
    val authRequest = new AuthRequest(authenticatedUser, testRequest)

    "when the api calls succeed" - {
      val subscriber = Subscriber("Text", Nil)
      when(api.user(anyString(), any[Auth])) thenReturn Future.successful(Right(user))
      when(api.userEmails(anyString(), any[TrackingData])) thenReturn Future.successful(Right(subscriber))

      "should lookup user data and email info" in {
        emailController.preferences()(authRequest)
        verify(api).user(userId, testAuth)
        verify(api).userEmails(userId, trackingData)
      }

      "should display form" in {
        val result = emailController.preferences()(authRequest)
        status(result) should equal(OK)
        val content = contentAsString(result)
        content should include("""<form class="form" novalidate action="/email-prefs" role="main" method="post">""")
        content should include("""<input type="checkbox" name="statusFields.receiveGnmMarketing" """)
        content should include("""<input type="checkbox" name="statusFields.receive3rdPartyMarketing" """)
      }
    }

    "when the API calls fail" - {
      when(api.user(anyString(), any[Auth])) thenReturn Future.successful(Left(List(error)))
      when(api.userEmails(anyString(), any[TrackingData])) thenReturn Future.successful(Left(List(error)))

      "should include the error message on the page" in {
        val result = emailController.preferences()(authRequest)
        contentAsString(result).contains(error.description) should equal(true)
      }
    }
  }

  "The save preferences method" - Fake {
    "When the form submission is valid" - {
      val gnmMarketing = "true"
      val thirdPartyMarketing = "true"
      val emailFormat = "Text"
      val fakeRequest = FakeCSRFRequest(POST, "/email-prefs")
        .withFormUrlEncodedBody("statusFields.receiveGnmMarketing" -> gnmMarketing, "statusFields.receive3rdPartyMarketing" -> thirdPartyMarketing, "htmlPreference" -> emailFormat, "csrfToken" -> "abc")
      val authRequest = new AuthRequest(authenticatedUser, fakeRequest)

      "with successful api calls" - {
        val updatedStatus = user.statusFields.copy(receiveGnmMarketing = Some(true), receive3rdPartyMarketing = Some(true))
        val updatedUser = user.copy(statusFields = updatedStatus)
        // Crazy Unit return type!
        when(api.updateUserEmails(anyString(), any[Subscriber], any[Auth], any[TrackingData])) thenReturn Future.successful(Right(()))
        when(api.updateUser(anyString(), any[Auth], any[TrackingData], anyString(), any[JValue])) thenReturn Future.successful(Right(updatedUser))

        "should call updateUser and updateUserEmails" in {
          emailController.savePreferences()(authRequest)
          verify(api).updateUser(userId, testAuth, trackingData, "statusFields", ("receiveGnmMarketing" -> true) ~ ("receive3rdPartyMarketing" -> true))
          verify(api).updateUserEmails(userId, Subscriber(emailFormat, Nil), testAuth, trackingData)
        }

        "should re-render the form" in {
          val result = emailController.savePreferences()(authRequest)
          status(result) should be(200)
          val content = contentAsString(result)
          content should include("""<form class="form" novalidate action="/email-prefs" role="main" method="post">""")
          content should include("""<input type="checkbox" name="statusFields.receiveGnmMarketing" """)
          content should include("""<input type="checkbox" name="statusFields.receive3rdPartyMarketing" """)
          content should include("checked")
        }
      }

      "with failed API user call" - {
        when(api.updateUserEmails(anyString(), any[Subscriber], any[Auth], any[TrackingData])) thenReturn Future.successful(Left(errors))
        when(api.updateUser(anyString(), any[Auth], any[TrackingData], anyString(), any[JValue])) thenReturn Future.successful(Right(user))

        "should include the error message on the page" in {
          val result = emailController.savePreferences()(authRequest)
          contentAsString(result).contains(error.description) should equal(true)
        }
      }

      "with failed API userEmails call" - {
        when(api.updateUser(anyString(), any[Auth], any[TrackingData], anyString(), any[JValue])) thenReturn Future.successful(Left(errors))
        when(api.updateUserEmails(anyString(), any[Subscriber], any[Auth], any[TrackingData])) thenReturn Future.successful(Right(()))

        "should include the error message on the page" in {
          val result = emailController.savePreferences()(authRequest)
          contentAsString(result).contains(error.description) should equal(true)
        }
      }
    }
  }
}
