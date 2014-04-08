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
import com.gu.identity.model.{PrivateFields, PublicFields, StatusFields, User}
import play.api.test.Helpers._
import actions.AuthRequest
import scala.Some
import play.api.mvc.SimpleResult
import services.IdentityRequest
import idapiclient.TrackingData
import test.{FakeCSRFRequest, Fake}
import play.api.test.FakeRequest
import client.Auth
import model.Countries

//TODO test form validation and population of form fields.
class EditProfileControllerTest extends path.FreeSpec with ShouldMatchers with MockitoSugar with OptionValues {
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val api = mock[IdApiClient]
  val idRequestParser = mock[IdRequestParser]
  val authService = mock[AuthenticationService]
  val idRequest = mock[IdentityRequest]
  val trackingData = mock[TrackingData]

  val userId: String = "123"
  val user = User("test@example.com", userId, statusFields = StatusFields(receive3rdPartyMarketing = Some(true), receiveGnmMarketing = Some(true)))
  val testAuth = new ScGuU("abc")

  val authActionWithUser = new AuthActionWithUser(authService, api, idRequestParser) {
    override protected def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]): Future[SimpleResult] = {
      block(AuthRequest(request, user, testAuth))
    }
  }
  when(idRequestParser.apply(Matchers.any[RequestHeader])) thenReturn idRequest
  when(idRequest.trackingData) thenReturn trackingData
  when(idRequest.returnUrl) thenReturn None

  val controller = new EditProfileController(idUrlBuilder, authActionWithUser, api, idRequestParser)

  "Given the submitPublicProfileForm method is called" - {
    val location = "Test location"
    val aboutMe = "Interesting"
    val interests = "Other interesting things"
    val webPage = "http://example.com/test"

    "with a valid CSRF request" - Fake{
      val fakeRequest = FakeCSRFRequest(POST, "/email-prefs")
        .withFormUrlEncodedBody(
          "location" -> location,
          "aboutMe" -> aboutMe,
          "interests" -> interests,
          "webPage" -> webPage
        )

      val updatedUser = user.copy(
        publicFields = PublicFields(
          location = Some(location),
          aboutMe = Some(aboutMe),
          interests = Some(interests),
          webPage = Some(webPage)
        )
      )
      when(api.saveUser(Matchers.any[String], Matchers.any[UserUpdate], Matchers.any[Auth]))
        .thenReturn(Future.successful(Right(updatedUser)))

      val result = controller.submitPublicProfileForm().apply(fakeRequest)

      "then the user should be saved on the ID API" in {
        val userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdate])
        verify(api).saveUser(Matchers.eq(userId), userUpdateCapture.capture(), Matchers.eq(testAuth))
        val userUpdate = userUpdateCapture.getValue

        userUpdate.publicFields.value.location.value should equal(location)
        userUpdate.publicFields.value.aboutMe.value should equal(aboutMe)
        userUpdate.publicFields.value.interests.value should equal(interests)
        userUpdate.publicFields.value.webPage.value should equal(webPage)
      }

      "then a status 200 should be returned" in {
        status(result) should be(200)
      }

    }

    "when the form submission does not pass its CSRF check" - {
      val fakeRequest = FakeRequest(POST, "/email-prefs")
      val authRequest = AuthRequest(fakeRequest, user, testAuth)

      "should throw a CSRF error" in {
        intercept[RuntimeException] {
          controller.submitPublicProfileForm().apply(authRequest)
        }
      }
    }
  }

  "Given the submitAccountForm method is called" - {
    val primaryEmailAddress = "john.smith@bobmail.com"
    val firstName = "John"
    val secondName = "Smith"
    val gender = "Male"
    val address1 = "10 Downing Street"
    val address2 = "London"
    val address3 = ""
    val address4 = ""
    val postcode = "N1 9GU"
    val country = Countries.UK

    "with a valid CSRF request" - Fake{
      val fakeRequest = FakeCSRFRequest(POST, "/email-prefs")
        .withFormUrlEncodedBody(
          ("primaryEmailAddress", primaryEmailAddress),
          ("firstName", firstName),
          ("secondName", secondName),
          ("gender", gender),
          ("address.line1", address1),
          ("address.line2", address2),
          ("address.line3", address3),
          ("address.line4", address4),
          ("address.postcode", postcode),
          ("address.country", country)
        )

      val updatedUser = user.copy(
        primaryEmailAddress = primaryEmailAddress,
        privateFields = PrivateFields(
          firstName = Some(firstName),
          secondName = Some(secondName),
          gender = Some(gender),
          address1 = Some(address1),
          address2 = Some(address2),
          address3 = Some(address3),
          address4 = Some(address4),
          postcode = Some(postcode),
          country = Some(country)
        )
      )

      when(api.saveUser(Matchers.any[String], Matchers.any[UserUpdate], Matchers.any[Auth]))
        .thenReturn(Future.successful(Right(updatedUser)))

      val result = controller.submitAccountForm().apply(fakeRequest)

      "then the user should be saved on the ID API" in {
        val userUpdateCapture = ArgumentCaptor.forClass(classOf[UserUpdate])
        verify(api).saveUser(Matchers.eq(userId), userUpdateCapture.capture(), Matchers.eq(testAuth))
        val userUpdate = userUpdateCapture.getValue

        userUpdate.primaryEmailAddress.value should equal(primaryEmailAddress)
        userUpdate.privateFields.value.firstName.value should equal(firstName)
        userUpdate.privateFields.value.secondName.value should equal(secondName)
        userUpdate.privateFields.value.gender.value should equal(gender)
        userUpdate.privateFields.value.address1.value should equal(address1)
        userUpdate.privateFields.value.address2.value should equal(address2)
        userUpdate.privateFields.value.address3 should equal(None)
        userUpdate.privateFields.value.address4 should equal(None)
        userUpdate.privateFields.value.postcode.value should equal(postcode)
        userUpdate.privateFields.value.country.value should equal(country)
      }

      "then a status 200 should be returned" in {
        status(result) should be(200)
      }
    }

    "when the form submission does not pass its CSRF check" - {
      val fakeRequest = FakeRequest(POST, "/email-prefs")
      val authRequest = AuthRequest(fakeRequest, user, testAuth)

      "should throw a CSRF error" in {
        intercept[RuntimeException] {
          controller.submitAccountForm().apply(authRequest)
        }
      }
    }
  }
}

