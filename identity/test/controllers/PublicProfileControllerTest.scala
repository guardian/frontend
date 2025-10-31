package controllers

import clients.DiscussionProfile
import com.gu.identity.model.{PublicFields, User, UserDates}
import idapiclient.{Auth, _}
import org.joda.time.DateTime
import org.mockito.Mockito._
import org.mockito.{ArgumentMatchers => MockitoMatchers}
import org.scalatest.freespec.PathAnyFreeSpec
import org.scalatest.matchers.should.Matchers
import org.scalatestplus.mockito.MockitoSugar
import play.api.mvc.RequestHeader
import play.api.test.Helpers._
import services._
import test.{Fake, TestRequest, WithTestApplicationContext}

import scala.concurrent.Future
import scala.util.Left

class PublicProfileControllerTest
    extends PathAnyFreeSpec
    with Matchers
    with WithTestApplicationContext
    with MockitoSugar {
  val idUrlBuilder = mock[IdentityUrlBuilder]
  val api = mock[IdApiClient]
  val discussionApi = mock[DiscussionApiService]
  val idRequestParser = mock[IdRequestParser]
  val idRequest = mock[IdentityRequest]

  val userId: String = "123"
  val discussionProfile = DiscussionProfile(userId, "John Smith")
  val vanityUrl: String = "bobski"
  val user = User(
    "test@example.com",
    userId,
    publicFields = PublicFields(
      displayName = Some("John Smith"),
      username = Some("John Smith"),
    ),
    dates = UserDates(
      accountCreatedDate = Some(new DateTime().minusDays(7)),
    ),
  )

  val userIdNotCommented: String = "789"
  val userNotCommented = User(
    "test@example.com",
    userIdNotCommented,
    publicFields = PublicFields(
      displayName = Some("John Smith"),
      username = Some("John Smith"),
    ),
    dates = UserDates(
      accountCreatedDate = Some(new DateTime().minusDays(7)),
    ),
  )

  when(idRequestParser.apply(MockitoMatchers.any[RequestHeader])) thenReturn idRequest

  val controller = new PublicProfileController(
    idUrlBuilder,
    api,
    idRequestParser,
    discussionApi,
    play.api.test.Helpers.stubControllerComponents(),
  )
  val request = TestRequest()

  "Given renderProfileFromId is called" - Fake {
    when(api.user(MockitoMatchers.anyString, MockitoMatchers.any[Auth])) thenReturn Future.successful(Left(Nil))
    when(api.user(userId)) thenReturn Future.successful(Right(user))
    when(discussionApi.findDiscussionUserFilterCommented(userId)) thenReturn Future.successful(Some(discussionProfile))

    when(api.user(userIdNotCommented)) thenReturn Future.successful(Right(userNotCommented))
    when(discussionApi.findDiscussionUserFilterCommented(userIdNotCommented)) thenReturn Future.successful(None)

    "with valid user Id who has commented" - {
      val result = controller.renderProfileFromId(userId, "discussions")(request)

      "then should return status 200" in {
        status(result) should be(200)
      }

      val content = contentAsString(result)
      "then rendered profile should include username" in {
        content should include(user.publicFields.username.get)
      }
      "then rendered profile should include account creation date" in {
        content should include(s"Registered on ${user.dates.accountCreatedDate.get.toString("d MMM yyyy")}")
      }
    }

    "with a valid user Id who has not commented" - {
      val result = controller.renderProfileFromId(userIdNotCommented, "discussions")(request)
      "then the status should be 200 since the user profile exists" in {
        status(result) should be(200)
        contentAsString(result) should include("No comments found for user")
      }
    }

    "with invalid user Id" - {
      val result = controller.renderProfileFromId("notAUser", "discussions")(request)

      "then the status should be 200 with no comments found" in {
        status(result) should be(200)
        contentAsString(result) should include("No comments found for user")
      }
    }
  }

  "Given renderProfileFromVanityUrl is called" - Fake {
    when(discussionApi.findDiscussionUserFilterCommented(userId)) thenReturn Future.successful(Some(discussionProfile))

    "with valid user Id who has commented" - {
      val result = controller.renderProfileFromVanityUrl(vanityUrl, "discussions")(request)

      "then should return status 200" in {
        status(result) should be(200)
      }

      "then rendered profile should display no comments found since vanity URLs are no longer supported in IDAPI" in {
        contentAsString(result) should include("No comments found for user")
      }
    }

    "with invalid user Id" - {
      val result = controller.renderProfileFromVanityUrl("notAUser", "discussions")(request)

      "then the status should be 200 with no comments found" in {
        status(result) should be(200)
        contentAsString(result) should include("No comments found for user")
      }
    }
  }
}
