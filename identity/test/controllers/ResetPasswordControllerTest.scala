package controllers

import org.scalatest.path
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar
import org.mockito.Matchers.any
import org.mockito.Mockito._
import idapiclient.{Email, IdApiClient}
import test.{TestRequest, Fake}
import play.api.test._
import play.api.test.Helpers._
import client.{Error, Auth}
import scala.concurrent.Future
import com.gu.identity.model.User


class ResetPasswordControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar {

  val api = mock[IdApiClient]

  val resetPasswordControkller = new ResetPasswordController(api)

  val userNotFound = List(Error("Not found", "Resource not found", 404))

  val user = mock[User]
  when(user.getPrimaryEmailAddress).thenReturn("someone@test.com")

  "the renderPasswordRequest method" - {
      "should render the password reset request form" in Fake {
        val result = resetPasswordControkller.renderPasswordResetRequestForm()(TestRequest())
        status(result) should equal(OK)
      }
  }

  "the processPasswordRequestForm" - {
    val fakeRequest = FakeRequest(POST, "/identity/recover").withFormUrlEncodedBody("email" -> "test@example.com")
    val auth = Email("test@example.com")

    "should reject an invalid email address" - {

       val fakeRequest = FakeRequest(POST, "/identity/recover").withFormUrlEncodedBody("email" -> "sdwedfesetre")
      "so the api is not called" in Fake {
        resetPasswordControkller.processPasswordResetRequestForm(fakeRequest)
        verify(api, never).userForToken(any[String], any[Auth])
      }

      "form is reshown is with errors" in Fake{
        resetPasswordControkller.processPasswordResetRequestForm(fakeRequest)
      }
    }

    "with an api response validating the user" - {
      when(api.email(any[Auth])).thenReturn(Future.successful(Right(user)))
      "should ask the api to send a reset email to the the the specified user" - {
        resetPasswordControkller.processPasswordResetRequestForm(fakeRequest)
        verify(api).sendPasswordResetEmail(auth)
      }
    }

    "with an api is unable to locate the user" - {
        when(api.email(any[Auth])).thenReturn(Future.successful(Left(userNotFound)))
        "should not send the the reset password email" - {
          resetPasswordControkller.processPasswordResetRequestForm(fakeRequest)
          verify(api).email(auth)
          verifyNoMoreInteractions(api)
        }
    }

  }
}
