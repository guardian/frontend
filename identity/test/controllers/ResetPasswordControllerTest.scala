package controllers

import org.scalatest.path
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar
import org.mockito.Matchers._
import org.mockito.Mockito._
import idapiclient.{OmnitureTracking, IdApiClient}
import test.{TestRequest, Fake}
import play.api.test._
import play.api.test.Helpers._
import client.{Error, Auth}
import scala.concurrent.Future
import com.gu.identity.model.User
import org.mockito.Matchers
import services.{IdentityRequest, IdentityUrlBuilder, IdRequestParser}

class ResetPasswordControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {

  val api = mock[IdApiClient]
  val requestParser = mock[IdRequestParser]
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val omnitureData = mock[OmnitureTracking]
  val identityRequest = IdentityRequest(omnitureData, None)

  val resetPasswordController = new ResetPasswordController(api, requestParser, idUrlBuilder)
  when(requestParser.apply(anyObject())).thenReturn(identityRequest)

  val userNotFound = List(Error("Not found", "Resource not found", 404))
  val tokenExpired = List(Error("Token expired", "The password reset token is longer valid"))
  val accesssDenied = List(Error("Access Denied", "Access Denied"))

  val user = mock[User]
  when(user.primaryEmailAddress).thenReturn("someone@test.com")

  "the renderPasswordRequest method" - {
    "should render the password reset request form" in Fake {
      val result = resetPasswordController.renderPasswordResetRequestForm()(TestRequest())
      status(result) should equal(OK)
    }
  }

  "the processPasswordRequestForm" - {
    var emailAddress: String = "test@example.com"
    val fakeRequest = FakeRequest(POST, "/reset").withFormUrlEncodedBody("email-address" -> emailAddress)

    "with an api response validating the user" - {
      when(api.sendPasswordResetEmail(any[String])).thenReturn(Future.successful(Right()))
      "should ask the api to send a reset email to the the the specified user" in Fake {
        resetPasswordController.processPasswordResetRequestForm(fakeRequest)
        verify(api).sendPasswordResetEmail(emailAddress)
      }
    }

    "with an api is unable to locate the user" - {
      when(api.sendPasswordResetEmail(any[String])).thenReturn(Future.successful(Left(userNotFound)))

        "should redirect to the form" in Fake {
          val result = resetPasswordController.processPasswordResetRequestForm(fakeRequest)
          status(result) should equal (OK)
        }
    }
  }

  "the handle render method" - {
    val fakeRequest = FakeRequest(GET, "/c/1234")
    "when the token provided is valid" - {
       when(api.userForToken(Matchers.any[String])).thenReturn(Future.successful(Right(user)))
       "should pass the token param to to the api" in Fake {
         resetPasswordController.processUpdatePasswordToken("1234")(fakeRequest)
         verify(api).userForToken(Matchers.eq("1234"))
       }

       "should render the reset password form when the user token has not expired" in Fake {
         val result = resetPasswordController.processUpdatePasswordToken("1234")(fakeRequest)
         status(result) should equal(OK)
       }
    }

    "should render the reset password form when the user token is not valid" - {
      when(api.userForToken("1234")).thenReturn(Future.successful(Left(tokenExpired)))
      "should render to the the to the request new password form" in Fake {
        val result = resetPasswordController.processUpdatePasswordToken("1234")(fakeRequest)
        status(result) should equal(OK)
      }
    }
  }

  "the reset password method" - {

    val fakeRequest = FakeRequest(POST, "/reset_password" ).withFormUrlEncodedBody("password" -> "newpassword", "password-confirm" -> "newpassword", "email-address" -> "test@somewhere.com")
    "when the token provided is valid" - {
      when(api.resetPassword(Matchers.any[String], Matchers.any[String])).thenReturn(Future.successful(Right()))
      "should call the api the password with the provided new password and token" in Fake {
         resetPasswordController.resetPassword("1234")(fakeRequest)
         verify(api).resetPassword(Matchers.eq("1234"), Matchers.eq("newpassword"))
      }
      "should return password confirmation view in" in Fake {
         val result = resetPasswordController.resetPassword("1234")(fakeRequest)
         status(result) should be (OK)
      }
    }

    "when the reset token has expired" - {
      when(api.resetPassword("1234","newpassword")).thenReturn(Future.successful(Left(tokenExpired)))
      "should redirect to request request new password with a token expired" in Fake {
        val result = resetPasswordController.resetPassword("1234")(fakeRequest)
        status(result) should equal(OK)
      }
    }

    "when the reset token is not valid" - {
      when(api.resetPassword("1234", "newpassword")).thenReturn(Future.successful(Left(accesssDenied)))
      "should redirect to request new password with a problem resetting your password" in Fake {
        val result = resetPasswordController.resetPassword("1234")(fakeRequest)
        status(result) should equal(OK)
      }
    }
  }
}
