package controllers

import java.net.URLEncoder

import org.scalatest.path
import org.scalatest.Matchers
import org.scalatest.mockito.MockitoSugar
import org.mockito.{Matchers => MockitoMatchers}
import org.mockito.Mockito._
import idapiclient.{IdApiClient, Response, TrackingData}
import test.{Fake, WithTestApplicationContext, WithTestExecutionContext, WithTestIdConfig}
import play.api.test._
import play.api.test.Helpers._

import scala.concurrent.ExecutionContext
import scala.concurrent.Future
import com.gu.identity.model.User
import idapiclient.responses.{CookiesResponse, Error}
import play.api.http.HttpConfiguration
import play.api.mvc.Cookie
import services._

class ResetPasswordControllerTest
    extends path.FreeSpec
    with Matchers
    with MockitoSugar
    with WithTestApplicationContext
    with WithTestIdConfig {

  val api = mock[IdApiClient]
  val requestParser = mock[IdRequestParser]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val trackingData = mock[TrackingData]
  val authenticationService = mock[AuthenticationService]
  val identityRequest = IdentityRequest(trackingData, None, None, Some("123.456.789.10"), Some(false), true)
  val signInService = mock[PlaySigninService]
  val cookieResponse = mock[CookiesResponse]
  val cookie = mock[Cookie]

  lazy val resetPasswordController = new ResetPasswordController(
    api,
    requestParser,
    idUrlBuilder,
    authenticationService,
    signInService,
    play.api.test.Helpers.stubControllerComponents(),
    HttpConfiguration.createWithDefaults(),
  )

  when(requestParser.apply(MockitoMatchers.anyObject())).thenReturn(identityRequest)
  when(
    idUrlBuilder.buildUrl(
      MockitoMatchers.eq("/reset/resend"),
      MockitoMatchers.eq(identityRequest),
      MockitoMatchers.anyVararg[(String, String)],
    ),
  ).thenReturn(testIdConfig.url + "/reset/resend")

  val userNotFound = List(Error("Not found", "Resource not found", 404))
  val tokenExpired = List(Error("Token expired", "The password reset token is longer valid"))
  val accesssDenied = List(Error("Access Denied", "Access Denied"))
  val cookieList = List(mock[Cookie])

  val user = mock[User]
  when(user.primaryEmailAddress).thenReturn("someone@test.com")

  "the handle render method" - {
    val fakeRequest = FakeRequest(GET, "/c/1234")
    "when the token provided is valid" - {
      when(api.userForToken(MockitoMatchers.any[String])).thenReturn(Future.successful(Right(user)))
      "should pass the token param to to the api" in Fake {
        resetPasswordController.processUpdatePasswordToken("1234", None)(fakeRequest)
        verify(api).userForToken(MockitoMatchers.eq("1234"))
      }

      "should render the reset password form when the user token has not expired" in Fake {
        val result = resetPasswordController.processUpdatePasswordToken("1234", None)(fakeRequest)
        status(result) should equal(SEE_OTHER)
        header("Location", result).head should be("/reset-password/1234")
      }

      "should propagate the returnUrl from the request" in Fake {
        val returnUrl = "https://profile.thegulocal.com/public/edit"
        val result = resetPasswordController.processUpdatePasswordToken("1234", Some(returnUrl))(fakeRequest)
        status(result) should equal(SEE_OTHER)
        header("Location", result).head should be(
          s"/reset-password/1234?returnUrl=${URLEncoder.encode(returnUrl, "UTF-8")}",
        )
      }
    }

    "should render the reset password form when the user token is not valid" - {
      when(api.userForToken("1234")).thenReturn(Future.successful(Left(tokenExpired)))
      "should render to the the to the request new password form" in Fake {
        val result = resetPasswordController.processUpdatePasswordToken("1234", None)(fakeRequest)
        status(result) should equal(SEE_OTHER)
        header("Location", result).head should endWith("/reset/resend")
      }
    }
  }

  "the reset password method" - {

    val fakeRequest = FakeRequest(POST, "/reset_password").withFormUrlEncodedBody(
      "password" -> "newpassword",
      "password-confirm" -> "newpassword",
      "email-address" -> "test@somewhere.com",
    )
    "when the token provided is valid" - {
      when(
        api.resetPassword(MockitoMatchers.any[String], MockitoMatchers.any[String], MockitoMatchers.any[TrackingData]),
      ).thenReturn(Future.successful(Right(cookieResponse)))
      when(
        signInService.getCookies(MockitoMatchers.any[Future[Response[CookiesResponse]]], MockitoMatchers.anyBoolean())(
          MockitoMatchers.any[ExecutionContext],
        ),
      ).thenReturn(Future.successful(Right(cookieList)))

      "should call the api the password with the provided new password and token" in Fake {
        resetPasswordController.resetPassword("1234", None)(fakeRequest)
        verify(api).resetPassword(
          MockitoMatchers.eq("1234"),
          MockitoMatchers.eq("newpassword"),
          MockitoMatchers.eq(identityRequest.trackingData),
        )
      }
      "should return password confirmation view in" in Fake {
        val result = resetPasswordController.resetPassword("1234", None)(fakeRequest)
        status(result) should be(SEE_OTHER)
        header("Location", result).head should be("/password/reset-confirmation")
      }
    }

    "when the reset token has expired" - {
      when(
        api.resetPassword(MockitoMatchers.any[String], MockitoMatchers.any[String], MockitoMatchers.any[TrackingData]),
      ).thenReturn(Future.successful(Right(cookieResponse)))
      when(
        signInService.getCookies(MockitoMatchers.any[Future[Response[CookiesResponse]]], MockitoMatchers.anyBoolean())(
          MockitoMatchers.any[ExecutionContext],
        ),
      ).thenReturn(Future.successful(Left(tokenExpired)))

      when(api.resetPassword("1234", "newpassword", identityRequest.trackingData))
        .thenReturn(Future.successful(Left(tokenExpired)))
      "should redirect to request request new password with a token expired" in Fake {
        val result = resetPasswordController.resetPassword("1234", None)(fakeRequest)
        status(result) should equal(SEE_OTHER)
        header("Location", result).head should endWith("/reset/resend")
      }
    }

    "when the reset token is not valid" - {
      when(
        signInService.getCookies(MockitoMatchers.any[Future[Response[CookiesResponse]]], MockitoMatchers.anyBoolean())(
          MockitoMatchers.any[ExecutionContext],
        ),
      ).thenReturn(Future.successful(Left(accesssDenied)))

      when(api.resetPassword("1234", "newpassword", identityRequest.trackingData))
        .thenReturn(Future.successful(Left(accesssDenied)))
      "should redirect to request new password with a problem resetting your password" in Fake {
        val result = resetPasswordController.resetPassword("1234", None)(fakeRequest)
        status(result) should equal(SEE_OTHER)
        header("Location", result).head should be("/reset")
      }
    }
  }
}
