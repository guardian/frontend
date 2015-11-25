package controllers

import org.mockito.Matchers
import org.scalatest.path
import org.scalatest.{Matchers => ShouldMatchers}
import org.scalatest.mock.MockitoSugar
import org.mockito.Mockito._
import org.mockito.Matchers._
import play.api.Play
import services._
import idapiclient.IdApiClient
import play.api.test.Helpers._
import play.api.test._
import test.{TestRequest, Fake}
import scala.concurrent.Future
import client.Auth
import conf.IdentityConfiguration
import play.api.mvc.Cookies
import org.joda.time.DateTime
import idapiclient.ClientAuth
import idapiclient.responses.CookieResponse
import idapiclient.EmailPassword
import idapiclient.TrackingData
import services.IdentityRequest
import idapiclient.responses.CookiesResponse
import play.api.test.Helpers._
import play.api.mvc.RequestHeader
import play.api.i18n.Messages.Implicits.applicationMessagesApi
import play.api.Play.current


class SigninControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val requestParser = mock[IdRequestParser]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val api = mock[IdApiClient]
  val conf = new IdentityConfiguration
  val trackingData = mock[TrackingData]
  val identityRequest = IdentityRequest(trackingData, Some("http://example.com/return"), None, None, Some(false), true)
  val signInService = new PlaySigninService(conf)

  lazy val signinController = new SigninController(returnUrlVerifier, api, requestParser, idUrlBuilder, signInService, applicationMessagesApi)
  when(requestParser.apply(anyObject())).thenReturn(identityRequest)
  when(returnUrlVerifier.getVerifiedReturnUrl(any[RequestHeader])).thenReturn(None)

  "the renderForm method" - {
    "should render the signin form" in Fake {
      val result = signinController.renderForm(None)(TestRequest())
      status(result) should equal(OK)
    }
  }

  "the processForm method" - {
    "should reject invalid credentials" - {
      val fakeRequest = FakeRequest(POST, "/signin").withFormUrlEncodedBody("email" -> "bad", "password" -> "bad")

      "so api is not called" in Fake {
        signinController.processForm()(fakeRequest)
        verify(api, never).authBrowser(any[Auth], same(trackingData), any[Option[Boolean]])
      }

      "form is re-shown with errors" in Fake {
        signinController.processForm()(fakeRequest)
      }
    }

    "with valid API response" - {
      val fakeRequest = FakeRequest(POST, "/signin").withFormUrlEncodedBody("email" -> "test@example.com", "password" -> "testpassword", "keepMeSignedIn" -> "true")
      val fakeSharedComputerRequest = FakeRequest(POST, "/signin").withFormUrlEncodedBody("email" -> "test@example.com", "password" -> "testpassword")
      val auth = EmailPassword("test@example.com", "testpassword", identityRequest.clientIp)

      "if api call succeeds" - {
        when(api.authBrowser(any[Auth], same(trackingData), any[Option[Boolean]])).thenReturn(Future.successful(Right(CookiesResponse(DateTime.now, List(CookieResponse("testCookie", "testVal"), CookieResponse("SC_testCookie", "secureVal"))))))

        "should call authBrowser with provided credentials" in Fake {
          signinController.processForm()(fakeRequest)
          verify(api).authBrowser(auth, trackingData, Some(true))
        }

        "should call authBrowser with provided credentials, asking for non-persistent cookies" in Fake {
          signinController.processForm()(fakeSharedComputerRequest)
          verify(api).authBrowser(auth, trackingData, Some(false))
        }

        "should redirect the user to the returnUrl" in Fake {
          when(returnUrlVerifier.getVerifiedReturnUrl(fakeRequest)).thenReturn(Some("http://example.com/return"))
          val result = signinController.processForm()(fakeRequest)
          status(result) should equal(SEE_OTHER)
          redirectLocation(result).get should equal("http://example.com/return")
        }

        "should set login cookies on response" in Fake {
          when(returnUrlVerifier.getVerifiedReturnUrl(fakeRequest)).thenReturn(Some("http://example.com/return"))
          val result = signinController.processForm()(fakeRequest)
          val responseCookies: Cookies  = cookies(result)
          val testCookie = responseCookies.get("testCookie").get
          testCookie should have('value("testVal"))
          testCookie should have('secure(false))
          testCookie should have('httpOnly(false))
          val secureTestCookie = responseCookies.get("SC_testCookie").get
          secureTestCookie should have('value("secureVal"))
          secureTestCookie should have('secure(true))
          secureTestCookie should have('httpOnly(true))
        }
      }
    }

    "should redirect without persisting the password" in Fake {

      val postRequest = FakeRequest(POST, "/signin").withFormUrlEncodedBody("email" -> "bad-email", "password" -> "good-password")
      val postResult = signinController.processForm()(postRequest)

      status(postResult) should be (303)
      header("Location", postResult) should be (Some("/signin"))

      val flashCookie = cookies(postResult).apply("PLAY_FLASH")


      withClue("the cookie should be encrypted"){
        flashCookie.value should not include "bad-email"
      }


      val getRequest = FakeRequest(GET, "/signin").withCookies(flashCookie)
      val getResult = signinController.renderForm(None)(getRequest)
      status(getResult) should be (200)
      val body = contentAsString(getResult)

      withClue("the user should have their password filled"){
        body should include ("bad-email")
      }

      withClue("the password should be stripped and not returned to the client"){
        body should not include "good-password"
      }
    }

    "should authenticate single letter subdomain" in Fake {
      when(api.authBrowser(any[Auth], same(trackingData), any[Option[Boolean]])).thenReturn(Future.successful(Right(CookiesResponse(DateTime.now, List(CookieResponse("testCookie", "testVal"), CookieResponse("SC_testCookie", "secureVal"))))))
      val goodRequest = FakeRequest(POST, "/signin").withFormUrlEncodedBody("email" -> "username@q.com", "password" -> "good-password")
      val badRequest = FakeRequest(POST, "/signin").withFormUrlEncodedBody("email" -> "usernameq$.com", "password" -> "good-password")

      header("Location", signinController.processForm()(goodRequest)) should not be (Some("/signin"))
    }
  }
}
