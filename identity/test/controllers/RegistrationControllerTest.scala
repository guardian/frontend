package controllers

import org.scalatest.path
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar
import test.{TestRequest, Fake}
import idapiclient.{OmnitureTracking, IdApiClient}
import services._
import play.api.test.Helpers._
import play.api.test.FakeRequest
import com.gu.identity.model.User
import org.mockito.Mockito._
import org.mockito.Matchers
import scala.concurrent.Future
import idapiclient.OmnitureTracking

class RegistrationControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar  {

  val returnUrlVerifier = mock[ReturnUrlVerifier]
  val api = mock[IdApiClient]
  val requestParser = mock[IdRequestParser]
  val urlBuilder = mock[IdentityUrlBuilder]
  val userCreationService = mock[UserCreationService]
  val user = mock[User]
  val createdUser = mock[User]
  when(userCreationService.createUser(Matchers.any[String], Matchers.any[String], Matchers.any[String], Matchers.any[Boolean], Matchers.any[Boolean] )).thenReturn(user)
  val omnitureData = mock[OmnitureTracking]
  val identityRequest = IdentityRequest(omnitureData, Some("http://example.com/comeback"))

  val registrationController = new RegistrationController(returnUrlVerifier, userCreationService, api, requestParser, urlBuilder)
  when(requestParser.apply(Matchers.anyObject())).thenReturn(identityRequest)

  "the renderRegistrationForm" - {
    "should render the registration form" in Fake {
      val result = registrationController.renderForm()(TestRequest())
      status(result) should equal(OK)
    }
  }

  "the process Registration method " - {
    "should not handle incomplete data" - {
      val badFakeRequest = FakeRequest(POST, "/register").withFormUrlEncodedBody("user.primaryEmailAddress" -> "test@example.com")
      "so the api is not called" in Fake {
        registrationController.processForm()(badFakeRequest)
        verify(api, never).register(Matchers.any[User], Matchers.same(omnitureData))
      }

      "form is re-shown with errors" in Fake {
        registrationController.processForm()(badFakeRequest)
      }
    }

    "with valid api response" - {
      val fakeRequest = FakeRequest(POST, "/register").withFormUrlEncodedBody("user.primaryEmailAddress" -> "test@example.com", "user.publicFields.username" -> "username", "user.password" -> "password" )
      when(api.register(user, omnitureData)).thenReturn(Future.successful(Right(createdUser)))
      "should create the user with the username, email and password required" in Fake {
        registrationController.processForm()(fakeRequest)
        verify(userCreationService).createUser("test@example.com", "username", "password", false, false)
      }

      "should pass marketing values to the create user service" in Fake {
        val fakeRequest = FakeRequest(POST, "/register")
          .withFormUrlEncodedBody("user.primaryEmailAddress" -> "test@example.com", "user.publicFields.username" -> "username", "user.password" -> "password", "receive_gnm_marketing" -> "true", "receive_third_party_marketing" -> "true" )
        registrationController.processForm()(fakeRequest)
        verify(userCreationService).createUser("test@example.com", "username", "password", true, true)
      }

      "should pass the created user to the api object to the api" in Fake {
        registrationController.processForm()(fakeRequest)
        verify(api).register(Matchers.same(user), Matchers.anyObject())
      }

      "shuold pass the the omniture data to the the api" in Fake {
        registrationController.processForm()(fakeRequest)
        verify(api).register(Matchers.anyObject(), Matchers.same(omnitureData))
      }
    }

    "with an invalid api response" - {
      val fakeRequest = FakeRequest(POST, "/register").withFormUrlEncodedBody("user.primaryEmailAddress" -> "test@example.com", "user.publicFields.username" -> "username", "user.password" -> "password" )
      when(api.register(user, omnitureData)).thenReturn(Future.successful(Right(createdUser)))
      "form is reshown with errors" in Fake {

      }
    }
  }
}
