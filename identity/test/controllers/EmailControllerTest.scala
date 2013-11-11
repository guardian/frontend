package controllers

import org.scalatest.{ShouldMatchers, path}
import services.{ReturnUrlVerifier, IdRequestParser, IdentityUrlBuilder}
import idapiclient.{ScGuU, IdApiClient}
import conf.{FrontendIdentityCookieDecoder, IdentityConfiguration}
import org.scalatest.mock.MockitoSugar
import utils.AuthRequest
import test.{FakeCSRFRequest, TestRequest, Fake}
import play.api.mvc.{RequestHeader, Request, SimpleResult}
import scala.concurrent.Future
import com.gu.identity.model.{StatusFields, User}
import org.mockito.Mockito._
import org.mockito.Matchers
import play.api.test.Helpers._
import play.api.test.FakeRequest
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonDSL._
import com.gu.identity.model.Subscriber
import scala.Some
import services.IdentityRequest
import client.Error
import idapiclient.TrackingData


class EmailControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val conf = mock[IdentityConfiguration]
  val api = mock[IdApiClient]
  val idRequestParser = mock[IdRequestParser]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val cookieDecoder = mock[FrontendIdentityCookieDecoder]
  val idRequest = mock[IdentityRequest]
  val trackingData = mock[TrackingData]

  val userId = "123"
  val user = User("test@example.com", userId, statusFields = StatusFields(receive3rdPartyMarketing = Some(true), receiveGnmMarketing = Some(true)))
  val testAuth = new ScGuU("abc")
  val error = Error("Test message", "Test description", 500)

  val authAction  = new utils.AuthAction(cookieDecoder, idRequestParser, idUrlBuilder) {
    override protected def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]): Future[SimpleResult] = {
      block(AuthRequest(request, user, testAuth))
    }
  }
  when(idRequestParser.apply(Matchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData

  val emailController = new EmailController(returnUrlVerifier, conf, api, idRequestParser, idUrlBuilder, authAction)

  "The preferences method" - Fake {
    val testRequest = TestRequest()
    val authRequest = AuthRequest(testRequest, user, testAuth)

    "when the api calls succeed" - {
      val subscriber = Subscriber("Text", Nil)
      when(api.multiple(Matchers.any[Future[client.Response[User]]], Matchers.any[Future[client.Response[Subscriber]]]))
        .thenReturn(Future.successful(Right((user, subscriber))))

      "should lookup user data and email info" in {
        emailController.preferences()(authRequest)
        verify(api).user(userId, testAuth)
        verify(api).userEmails(userId, trackingData)
      }

      "should display form" in {
        val result = emailController.preferences()(authRequest)
        status(result) should equal(OK)
      }
    }

    "when the API calls fail" - {
      when(api.multiple(Matchers.any[Future[client.Response[User]]], Matchers.any[Future[client.Response[Subscriber]]]))
        .thenReturn(Future.successful(Left(List(error))))

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
        .withFormUrlEncodedBody("receive_gnm_marketing" -> gnmMarketing, "receive_third_party_marketing" -> thirdPartyMarketing, "email_format" -> emailFormat )
      val authRequest = AuthRequest(fakeRequest, user, testAuth)

      "with successful api calls" - {
        val statusFields = ("receiveGnmMarketing" -> gnmMarketing) ~ ("receive3rdPartyMarketing" -> thirdPartyMarketing)
        when(api.multiple(Matchers.any[Future[client.Response[JValue]]], Matchers.any[Future[client.Response[Unit]]]))
          .thenReturn(Future.successful(Right((statusFields, ()))))

        "should call updateUser and updateUserEmails" in {
          emailController.savePreferences()(authRequest)
          verify(api).updateUser(userId, testAuth, trackingData, "statusFields", ("receiveGnmMarketing" -> true) ~ ("receive3rdPartyMarketing" -> true))
          verify(api).updateUserEmails(userId, Subscriber(emailFormat, Nil), testAuth, trackingData)
        }

        "should redirect back to the form" in {
          when(idUrlBuilder.buildUrl(Matchers.any[String], Matchers.any[IdentityRequest], Matchers.any[(String, String)])) thenReturn "/email-prefs"
          val result = emailController.savePreferences()(authRequest)
          redirectLocation(result).get should endWith ("/email-prefs")
        }
      }

      "with failed API calls" - {
        when(api.multiple(Matchers.any[Future[client.Response[JValue]]], Matchers.any[Future[client.Response[Unit]]]))
          .thenReturn(Future.successful(Left(List(error))))

        "should include the error message on the page" in {
          val result = emailController.savePreferences()(authRequest)
          contentAsString(result).contains(error.description) should equal(true)
        }
      }
    }

    "when the form submission does not pass its CSRF check" - {
      val fakeRequest = FakeRequest(POST, "/email-prefs")
      val authRequest = AuthRequest(fakeRequest, user, testAuth)

      "should throw a CSRF error" in {
        intercept[RuntimeException]{
          emailController.savePreferences()(authRequest)
        }
      }
    }
  }
}
