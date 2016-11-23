package controllers

import org.scalatest.{Matchers => ShouldMatchers, DoNotDiscover, WordSpec}
import org.scalatest.mock.MockitoSugar
import org.scalatestplus.play.ConfiguredServer
import services._
import org.mockito.Mockito._
import org.mockito.Matchers._
import conf.IdentityConfiguration
import idapiclient.IdApiClient
import play.api.test._
import client.Auth
import scala.concurrent.Future
import org.joda.time.DateTime
import play.api.mvc._
import idapiclient.responses.CookieResponse
import idapiclient.UserCookie
import services.IdentityRequest
import idapiclient.responses.CookiesResponse
import idapiclient.TrackingData
import play.api.mvc.Cookie
import play.api.test.Helpers._


@DoNotDiscover class SignoutControllerTest extends WordSpec with ShouldMatchers with MockitoSugar with ConfiguredServer {

  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val conf = new IdentityConfiguration
  val api = mock[IdApiClient]
  val idRequestParser = mock[IdRequestParser]
  val signInService = new PlaySigninService(conf)
  val signoutController = new SignoutController( returnUrlVerifier, conf, api, idRequestParser, signInService)
  val trackingData = mock[TrackingData]

  val identityRequest = IdentityRequest(trackingData, Some("http://example.com/return"), None, None, Some(false), false)
  when(idRequestParser.apply(anyObject())).thenReturn(identityRequest)

  "the signout method" should {
    val fakeRequest = FakeRequest(GET, "/signout").withCookies(Cookie("SC_GU_U","testscguuval"))
    when(returnUrlVerifier.getVerifiedReturnUrl(fakeRequest)).thenReturn(Some("http://example.com/return"))

    when(api.unauth(any[Auth], same(trackingData))).thenReturn(Future.successful(Right(CookiesResponse(DateTime.now, List(CookieResponse("test_gu_so", "testVal"))))))
    "call the api with the secure cookie data" in {
      signoutController.signout()(fakeRequest)
      verify(api).unauth(UserCookie("testscguuval"),trackingData)
    }

    "redirect the user to the returnUrl" in {
      val result = signoutController.signout()(fakeRequest)
      status(result) should equal(FOUND)
      redirectLocation(result).get should equal("http://example.com/return")
    }

    "set the signout cookie on the response" in {
      val result = signoutController.signout()(fakeRequest)
      val responseCookies: Cookies = cookies(result)
      val testSignOutCookie = responseCookies.get("test_gu_so").get
      testSignOutCookie should have('value ("testVal"))
      testSignOutCookie should have('secure (false))
      testSignOutCookie should have('httpOnly (false))
    }
  }
}
