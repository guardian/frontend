package controllers

import org.scalatest.path
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar
import org.mockito.Mockito._
import org.mockito.Matchers.any
import services.ReturnUrlVerifier
import idapiclient.{EmailPassword, IdApiClient}
import play.api.test.Helpers._
import play.api.test._
import test.{TestRequest, Fake}
import scala.concurrent.Future
import idapiclient.responses.CookieResponse
import client.Auth
import conf.IdentityConfiguration


class SigninControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {
  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val api = mock[IdApiClient]
  val conf = mock[IdentityConfiguration]

  val signinController = new SigninController(returnUrlVerifier, api, conf)

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
        verify(api, never).authBrowser(any[Auth])
      }

      "form is re-shown with errors" in Fake {
        signinController.processForm()(fakeRequest)
      }
    }

    "with valid API response" - {
      val fakeRequest = FakeRequest(POST, "/signin").withFormUrlEncodedBody("email" -> "test@example.com", "password" -> "testpassword")
      val auth = EmailPassword("test@example.com", "testpassword")

      "if api call succeeds" - {
        when(api.authBrowser(any[Auth])).thenReturn(Future.successful(Right(List(CookieResponse("testCookie", "testVal"), CookieResponse("SC_testCookie", "secureVal")))))

        "should call authBrowser with provided credentials" in Fake {
          signinController.processForm()(fakeRequest)
          verify(api).authBrowser(auth)
        }

        "should redirect the user to the returnUrl" in Fake {
          when(returnUrlVerifier.getVerifiedReturnUrl(fakeRequest)).thenReturn("http://example.com/return")
          val result = signinController.processForm()(fakeRequest)
          status(result) should equal(SEE_OTHER)
          redirectLocation(result).get should equal("http://example.com/return")
        }

        "should set login cookies on response" in Fake {
          val result = signinController.processForm()(fakeRequest)
          val responseCookies: play.api.mvc.Cookies  = cookies(result)
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
