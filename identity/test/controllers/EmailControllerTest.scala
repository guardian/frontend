package controllers

import org.scalatest.{ShouldMatchers, path}
import services.{IdentityRequest, ReturnUrlVerifier, IdRequestParser, IdentityUrlBuilder}
import idapiclient.{TrackingData, ScGuU, IdApiClient}
import conf.{FrontendIdentityCookieDecoder, IdentityConfiguration}
import org.scalatest.mock.MockitoSugar
import test.{TestRequest, Fake}
import play.api.mvc.{RequestHeader, SimpleResult, Request}
import utils.{AuthenticationService, AuthRequest}
import scala.concurrent.Future
import com.gu.identity.model.{StatusFields, Subscriber, User}
import org.mockito.Mockito._
import org.mockito.Matchers
import play.api.test.Helpers._
import client.Error
import play.api.test.FakeRequest
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.JsonDSL._


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
  val user = User("test@example.com", userId, statusFields = StatusFields(receive3rdPartyMarketing = Some(true), receiveGnmMarketing = Some(true)))
  val testAuth = new ScGuU("abc")
  val error = Error("Test message", "Test description", 500)

  val authAction  = new utils.AuthAction(authService) {
    override protected def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]): Future[SimpleResult] = {
      block(AuthRequest(request, user, testAuth))
    }
  }
  when(idRequestParser.apply(Matchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData

  val emailController = new EmailController(returnUrlVerifier, conf, api, idRequestParser, idUrlBuilder, authAction)

  "The preferences method" - {
    val testRequest = TestRequest()
    val authRequest = AuthRequest(testRequest, user, testAuth)

    "when the api calls succeed" - {
      val subscriber = Subscriber("Text", Nil)
      when(api.multiple(Matchers.any[Future[client.Response[User]]], Matchers.any[Future[client.Response[Subscriber]]]))
        .thenReturn(Future.successful(Right((user, subscriber))))

      "should lookup user data and email info" in Fake {
        emailController.preferences()(authRequest)
        verify(api).user(userId, testAuth)
        verify(api).userEmails(userId, trackingData)
      }

      "should display form" in Fake {
        val result = emailController.preferences()(authRequest)
        status(result) should equal(OK)
      }
    }

    "when the API calls fail" - {
      when(api.multiple(Matchers.any[Future[client.Response[User]]], Matchers.any[Future[client.Response[Subscriber]]]))
        .thenReturn(Future.successful(Left(List(error))))

      "should include the error message on the page" in Fake {
        val result = emailController.preferences()(authRequest)
        contentAsString(result).contains(error.description) should equal(true)
      }
    }
  }

  "The save preferences method" - {
    "When the form submission is valid" - {
      val gnmMarketing = "true"
      val thirdPartyMarketing = "true"
      val emailFormat = "Text"
      val fakeRequest = FakeRequest(POST, "/email-prefs")
        .withFormUrlEncodedBody("receive_gnm_marketing" -> gnmMarketing, "receive_third_party_marketing" -> thirdPartyMarketing, "email_format" -> emailFormat )
      val authRequest = AuthRequest(fakeRequest, user, testAuth)

      "with successful api calls" - {
        val statusFields = ("receiveGnmMarketing" -> gnmMarketing) ~ ("receive3rdPartyMarketing" -> thirdPartyMarketing)
        when(api.multiple(Matchers.any[Future[client.Response[JValue]]], Matchers.any[Future[client.Response[Unit]]]))
          .thenReturn(Future.successful(Right((statusFields, ()))))

        "should call updateUser and updateUserEmails" in Fake {
          emailController.savePreferences()(authRequest)
          verify(api).updateUser(userId, testAuth, trackingData, "statusFields", ("receiveGnmMarketing" -> true) ~ ("receive3rdPartyMarketing" -> true))
          verify(api).updateUserEmails(userId, Subscriber(emailFormat, Nil), testAuth, trackingData)
        }

        "should redirect back to the form" in Fake {
          when(idUrlBuilder.buildUrl(Matchers.any[String], Matchers.any[IdentityRequest], Matchers.any[(String, String)])) thenReturn "/email-prefs"
          val result = emailController.savePreferences()(authRequest)
          redirectLocation(result).get should endWith ("/email-prefs")
        }
      }

      "with failed API calls" - {
        when(api.multiple(Matchers.any[Future[client.Response[JValue]]], Matchers.any[Future[client.Response[Unit]]]))
          .thenReturn(Future.successful(Left(List(error))))

        "should include the error message on the page" in Fake {
          val result = emailController.savePreferences()(authRequest)
          contentAsString(result).contains(error.description) should equal(true)
        }
      }
    }

    "when the form submission is not valid" - {
      val fakeRequest = FakeRequest(POST, "/email-prefs")
      val authRequest = AuthRequest(fakeRequest, user, testAuth)

      "The email format error message should be displayed" in Fake {
        val result = emailController.savePreferences()(authRequest)
//        println(contentAsString(result))
      }
    }
  }
}
