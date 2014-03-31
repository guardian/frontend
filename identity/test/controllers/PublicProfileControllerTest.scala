package controllers

import org.scalatest._
import org.scalatest.mock.MockitoSugar
import services.{AuthenticationService, IdRequestParser, IdentityUrlBuilder}
import actions.AuthActionWithUser
import idapiclient._
import org.mockito.Mockito._
import org.mockito.{ArgumentCaptor, Matchers}
import play.api.mvc.{RequestHeader, Request}
import scala.concurrent.Future
import com.gu.identity.model.{StatusFields, User}
import play.api.test.Helpers._
import actions.AuthRequest
import play.api.mvc.SimpleResult
import services.IdentityRequest
import idapiclient.TrackingData
import test.{FakeCSRFRequest, Fake}
import play.api.test.FakeRequest
import client.Auth


class PublicProfileControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar with OptionValues {
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val api = mock[IdApiClient]
  val idRequestParser = mock[IdRequestParser]
  val authService = mock[AuthenticationService]
  val idRequest = mock[IdentityRequest]
  val trackingData = mock[TrackingData]

  val userId = "123"
  val user = User("test@example.com", userId, statusFields = StatusFields(receive3rdPartyMarketing = Some(true), receiveGnmMarketing = Some(true)))
  val testAuth = new ScGuU("abc")

  val authActionWithUser  = new AuthActionWithUser(authService, api, idRequestParser) {
    override protected def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]): Future[SimpleResult] = {
      block(AuthRequest(request, user, testAuth))
    }
  }
  when(idRequestParser.apply(Matchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData

  val controller = new PublicProfileController(idUrlBuilder, authActionWithUser, api, idRequestParser)

  "the submit form method" - {
    val location = "Test location"
    val aboutMe = "Interesting"
    val interests = "Other interesting things"
    val webPage = "http://example.com/test"

    "should call api save user with the form info" in Fake {
      val fakeRequest = FakeCSRFRequest(POST, "/email-prefs")
        .withFormUrlEncodedBody(
        "location" -> location,
        "aboutMe" -> aboutMe,
        "interests" -> interests,
        "webPage" -> webPage
      )
      when(api.saveUser(Matchers.any[String], Matchers.any[UserUpdate], Matchers.any[Auth]))
        .thenReturn(Future.successful(Right(user)))

      controller.submitForm(true)(fakeRequest)

      var userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdate])
      verify(api).saveUser(Matchers.eq(userId), userUpdateCapture.capture(), Matchers.eq(testAuth))
      val userUpdate = userUpdateCapture.getValue
      userUpdate.publicFields.value.location.value should equal(location)
      userUpdate.publicFields.value.aboutMe.value should equal(aboutMe)
      userUpdate.publicFields.value.interests.value should equal(interests)
      userUpdate.publicFields.value.webPage.value should equal(webPage)
    }

    "when the form submission does not pass its CSRF check" - {
      val fakeRequest = FakeRequest(POST, "/email-prefs")
      val authRequest = AuthRequest(fakeRequest, user, testAuth)

      "should throw a CSRF error" in {
        intercept[RuntimeException]{
          controller.submitForm(true)(authRequest)
        }
      }
    }
  }
}
