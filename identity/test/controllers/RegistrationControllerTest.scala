package controllers

import org.scalatest.path
import org.scalatest.matchers.ShouldMatchers
import org.scalatest.mock.MockitoSugar
import test.{TestRequest, Fake}
import idapiclient.{EmailPassword, OmnitureTracking, IdApiClient}
import services._
import play.api.test.Helpers._
import play.api.test.FakeRequest
import com.gu.identity.model.User
import org.mockito.Mockito._
import org.mockito.Matchers
import scala.concurrent.Future
import client.Error
import idapiclient.responses.{CookieResponse, CookiesResponse}
import org.joda.time.DateTime
import play.api.mvc.Cookies
import conf.IdentityConfiguration

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
  val conf = new IdentityConfiguration
  val signinService = new PlaySigninService(conf)


  val registrationController = new RegistrationController(returnUrlVerifier, userCreationService, api, requestParser, urlBuilder, signinService)
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
   }

    "with valid api response" - {
      val email = "test@example.com"
      val username = "username"
      val password = "password"
      val auth = EmailPassword(email, password)
      val fakeRequest = FakeRequest(POST, "/register").withFormUrlEncodedBody("user.primaryEmailAddress" -> email, "user.publicFields.username" -> username, "user.password" -> password )
      when(api.register(user, omnitureData)).thenReturn(Future.successful(Right(createdUser)))
      when(api.authBrowser(EmailPassword(email, password), omnitureData)).thenReturn(Future.successful(Right(CookiesResponse(DateTime.now, List(CookieResponse("testCookie", "testVal"), CookieResponse("SC_testCookie", "secureVal"))))))

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

      "should try to sign the user in after registration" ignore  {
        // The nested async cause this test fo fail - and we've no way of refactoring them as yet
        when(returnUrlVerifier.getVerifiedReturnUrl(fakeRequest)).thenReturn(Some("http://example.com/return"))
        registrationController.processForm()(fakeRequest)
        //verify(api).register(Matchers.eq(user), Matchers.same(omnitureData))
        verify(api).authBrowser(auth, omnitureData)
      }

      "should set login cookies on valid auth response" in Fake {
        when(returnUrlVerifier.getVerifiedReturnUrl(fakeRequest)).thenReturn(Some("http://example.com/return"))

        val result = registrationController.processForm()(fakeRequest)
        val responseCookies : Cookies = cookies(result)
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

    "with an invalid api response" - {
      val fakeRequest = FakeRequest(POST, "/register").withFormUrlEncodedBody("user.primaryEmailAddress" -> "test@example.com", "user.publicFields.username" -> "username", "user.password" -> "password" )
      val badPassword = List(Error("Invalid password:", "Password should be between 6 and 20 characters long:", 500, Some("user.password")))

      when(api.register(user, omnitureData)).thenReturn(Future.successful(Left(badPassword)))
      "form is reshown with errors" in Fake {
        registrationController.processForm()(fakeRequest)
      }

     "there is no attempt to sign the user in" in Fake {
        registrationController.processForm()(fakeRequest)
        verify(api).register(Matchers.anyObject(), Matchers.same(omnitureData))
        verifyNoMoreInteractions(api)
     }
   }

   "with a error response from the api auth call" - {

      val email = "test@example.com"
      val password = "password"
      val fakeRequest = FakeRequest(POST, "/register").withFormUrlEncodedBody("user.primaryEmailAddress" -> email, "user.publicFields.username" -> "username", "user.password" -> password )
      val errors = List(Error("Message", "Description", 500, Some("Context")))

      when(api.register(user, omnitureData)).thenReturn(Future.successful(Right(createdUser)))
      when(api.authBrowser(EmailPassword(email, password), omnitureData)).thenReturn(Future.successful(Left(errors)))
      when(returnUrlVerifier.getVerifiedReturnUrl(fakeRequest)).thenReturn(Some("http://example.com/return"))

      "there are no cookies on the response" in Fake {
        val result = registrationController.processForm()(fakeRequest)
        val responseCookies : Cookies = cookies(result)
        responseCookies.get("testCookie") match {
          case Some(cookie) => fail("unexpected cookie on result")
          case _ =>
        }
      }
   }
  }
}
