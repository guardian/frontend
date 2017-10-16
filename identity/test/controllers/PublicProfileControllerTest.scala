package controllers

import org.scalatest._
import org.scalatest.mockito.MockitoSugar
import services.{IdRequestParser, IdentityUrlBuilder}
import idapiclient._
import org.mockito.Mockito._
import org.mockito.{Matchers => MockitoMatchers}
import play.api.mvc.RequestHeader
import play.api.test.Helpers._
import com.gu.identity.model.{PublicFields, User, UserDates}
import services.IdentityRequest
import test.{Fake, TestRequest, WithTestApplicationContext}
import org.joda.time.DateTime

import scala.concurrent.Future
import scala.util.Left
import idapiclient.Auth

class PublicProfileControllerTest extends path.FreeSpec
  with Matchers
  with WithTestApplicationContext
  with MockitoSugar {
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val api = mock[IdApiClient]
  val idRequestParser = mock[IdRequestParser]
  val idRequest = mock[IdentityRequest]

  val userId: String = "123"
  val vanityUrl: String = "bobski"
  val user = User("test@example.com", userId,
    publicFields = PublicFields(
      displayName = Some("John Smith"),
      aboutMe = Some("I read the Guardian"),
      location = Some("London"),
      interests = Some("I like stuff"),
      vanityUrl = Some(vanityUrl)
    ),
    dates = UserDates(
      accountCreatedDate = Some(new DateTime().minusDays(7))
    )
  )

  when(idRequestParser.apply(MockitoMatchers.any[RequestHeader])) thenReturn idRequest

  val controller = new PublicProfileController(
    idUrlBuilder,
    api,
    idRequestParser,
    play.api.test.Helpers.stubControllerComponents()
  )
  val request = TestRequest()

  "Given renderProfileFromId is called" - Fake {
    when(api.user(MockitoMatchers.anyString, MockitoMatchers.any[Auth])) thenReturn Future.successful(Left(Nil))
    when(api.user(userId)) thenReturn Future.successful(Right(user))

    "with valid user Id" - {
      val result = controller.renderProfileFromId(userId, "discussions")(request)

      "then should return status 200" in {
        status(result) should be(200)
      }

      val content = contentAsString(result)
      "then rendered profile should include display name" in {
        content should include(user.publicFields.displayName.get)
      }
      "then rendered profile should include account creation date" in {
        content should include(s"Registered on ${user.dates.accountCreatedDate.get.toString("d MMM yyyy")}")
      }
    }

    "with invalid user Id" - {
      val result = controller.renderProfileFromId("notAUser", "discussions")(request)

      "then the status should be 404" in {
        status(result) should be(404)
      }
    }
  }

  "Given renderProfileFromVanityUrl is called" - Fake {
    when(api.userFromVanityUrl(MockitoMatchers.anyString, MockitoMatchers.any[Auth])) thenReturn Future.successful(Left(Nil))
    when(api.userFromVanityUrl(vanityUrl)) thenReturn Future.successful(Right(user))

    "with valid user Id" - {
      val result = controller.renderProfileFromVanityUrl(vanityUrl, "discussions")(request)

      "then should return status 200" in {
        status(result) should be(200)
      }

      val content = contentAsString(result)
      "then rendered profile should include display name" in {
        content should include(user.publicFields.displayName.get)
      }
      "then rendered profile should include account creation date" in {
        content should include(s"Registered on ${user.dates.accountCreatedDate.get.toString("d MMM yyyy")}")
      }
    }

    "with invalid user Id" - {
      val result = controller.renderProfileFromVanityUrl("notAUser", "discussions")(request)

      "then the status should be 404" in {
        status(result) should be(404)
      }
    }

    "with no display name for the specified user" - {
      val guestUser = user.copy(publicFields = user.publicFields.copy(displayName = None))
      when(api.userFromVanityUrl(MockitoMatchers.anyString, MockitoMatchers.any[Auth])) thenReturn Future.successful(Left(Nil))
      when(api.userFromVanityUrl(vanityUrl)) thenReturn Future.successful(Right(guestUser))
      val result = controller.renderProfileFromVanityUrl(vanityUrl, "discussions")(request)

      "then should return status 404" in {
        status(result) should be(404)
      }
    }
  }

}
