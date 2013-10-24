package controllers

import org.scalatest.path
import org.scalatest.mock.MockitoSugar
import org.scalatest.matchers.ShouldMatchers
import services._
import org.mockito.Mockito._
import org.mockito.Matchers._
import conf.IdentityConfiguration
import idapiclient.{UserCookie, IdApiClient, TrackingData}
import play.api.test.Helpers._
import play.api.test._
import client.Auth
import idapiclient.responses.{CookieResponse, CookiesResponse}
import scala.concurrent.Future
import org.joda.time.DateTime
import play.api.mvc._
import test.Fake
import scala.Some
import idapiclient.responses.CookieResponse
import idapiclient.UserCookie
import services.IdentityRequest
import idapiclient.responses.CookiesResponse
import idapiclient.TrackingData
import play.api.mvc.Cookie


class SignoutControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar{

  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val conf = new IdentityConfiguration
  val api = mock[IdApiClient]
  val idRequestParser = mock[IdRequestParser]
  val signInService = new PlaySigninService(conf)
  val signoutController = new SignoutController( returnUrlVerifier, conf, api, idRequestParser, signInService)
  val trackingData = mock[TrackingData]

  val identityRequest = IdentityRequest(trackingData, Some("http://example.com/return"), None)
  when(idRequestParser.apply(anyObject())).thenReturn(identityRequest)

  "the signout method" - {
    "with a valid API response" - {
       val fakeRequest = FakeRequest(GET, "/signout").withCookies(Cookie("SC_GU_U","testscguuval"))
       when(returnUrlVerifier.getVerifiedReturnUrl(fakeRequest)).thenReturn(Some("http://example.com/return"))

      "if api call succeeds" - {
         when(api.unauth(any[Auth], same(trackingData))).thenReturn(Future.successful(Right(CookiesResponse(DateTime.now, List(CookieResponse("test_gu_so", "testVal"))))))
         "should call the api with the secure cookie data" in Fake {
           signoutController.signout()(fakeRequest)
           verify(api).unauth(UserCookie("testscguuval"),trackingData)
         }

         "should redirect the user to the returnUrl" in Fake {
            val result = signoutController.signout()(fakeRequest)
            status(result) should equal(FOUND)
            redirectLocation(result).get should equal("http://example.com/return")
         }

         "should set the signout cookie on the response" in Fake {
            val result = signoutController.signout()(fakeRequest)
            val responseCookies : Cookies = cookies(result)
            val testSignOutCookie = responseCookies.get("test_gu_so").get
            testSignOutCookie should have('value("testVal"))
            testSignOutCookie should have('secure(false))
            testSignOutCookie should have('httpOnly(false))
         }
       }
    }
  }
}
