package controllers

import org.scalatest.path
import org.scalatest.Matchers
import org.scalatest.mock.MockitoSugar
import org.mockito.Mockito._
import org.mockito.Matchers._
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


class SigninControllerTest extends path.FreeSpec with Matchers with MockitoSugar {
  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val requestParser = mock[IdRequestParser]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val api = mock[IdApiClient]
  val conf = new IdentityConfiguration
  val trackingData = mock[TrackingData]
  val identityRequest = IdentityRequest(trackingData, Some("http://example.com/return"), None)
  val signInService = new PlaySigninService(conf)

  val signinController = new SigninController(returnUrlVerifier, api, requestParser, idUrlBuilder, signInService)
  when(requestParser.apply(anyObject())).thenReturn(identityRequest)


  "the renderForm method" - {
    "should render the signin form" in Fake {
      val result = signinController.renderForm()(TestRequest())
      status(result) should equal(OK)
    }
  }

  "the processForm method" - {
    "should reject invalid credentials" - {
      val fakeRequest = FakeRequest(POST, "/signin").withFormUrlEncodedBody("email" -> "bad", "password" -> "bad")

      "so api is not called" in Fake {
        signinController.processForm()(fakeRequest)
        verify(api, never).authBrowser(any[Auth], same(trackingData))
      }

      "form is re-shown with errors" in Fake {
        signinController.processForm()(fakeRequest)
      }
    }

    "with valid API response" - {
      val fakeRequest = FakeRequest(POST, "/signin").withFormUrlEncodedBody("email" -> "test@example.com", "password" -> "testpassword")
      val auth = EmailPassword("test@example.com", "testpassword")
      val clientAuth = ClientAuth("frontend-dev-client-token")

      "if api call succeeds" - {
        when(api.authBrowser(any[Auth], same(trackingData))).thenReturn(Future.successful(Right(CookiesResponse(DateTime.now, List(CookieResponse("testCookie", "testVal"), CookieResponse("SC_testCookie", "secureVal"))))))

        "should call authBrowser with provided credentials" in Fake {
          signinController.processForm()(fakeRequest)
          verify(api).authBrowser(auth, trackingData)
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
  }
}
