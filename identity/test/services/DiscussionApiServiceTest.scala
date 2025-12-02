package services

import clients.{DiscussionClient, DiscussionProfile, DiscussionProfileResponse, DiscussionProfileStats}
import metadata.MetaDataMatcher.convertToAnyShouldWrapper
import org.mockito.Mockito._
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatestplus.mockito.MockitoSugar
import scala.concurrent.Future
import scala.language.reflectiveCalls

class DiscussionApiServiceTest extends AsyncFlatSpec with MockitoSugar {
  private def buildFixtures() =
    new {
      val discussionClient = mock[DiscussionClient]
      val userId = "123"
      val displayName = "displayName"
      val discussionProfile = DiscussionProfile(userId, displayName)
      val discussionProfileResponse = DiscussionProfileResponse("ok", discussionProfile)
      val profileStats = DiscussionProfileStats("ok", 5, 0)
    }

  "findDiscussionUserFilterCommented" should "retrieve a DiscussionProfile if the user exists with comments" in {
    val fixtures = buildFixtures()
    import fixtures._

    when(discussionClient.findDiscussionUser(userId)) thenReturn Future.successful(Some(discussionProfileResponse))
    when(discussionClient.profileHasAtLeastOneComment(userId)) thenReturn Future.successful(true)

    val discussionApiService = new DiscussionApiService(discussionClient)
    discussionApiService.findDiscussionUserFilterCommented(userId).map(_ shouldBe Some(discussionProfile))
  }

  "findDiscussionUserFilterCommented" should "return None if there are no comments" in {
    val fixtures = buildFixtures()
    import fixtures._

    when(discussionClient.findDiscussionUser(userId)) thenReturn Future.successful(Some(discussionProfileResponse))
    when(discussionClient.profileHasAtLeastOneComment(userId)) thenReturn Future.successful(false)

    val discussionApiService = new DiscussionApiService(discussionClient)
    discussionApiService.findDiscussionUserFilterCommented(userId).map(_ shouldBe None)
  }

  "findDiscussionUserFilterCommented" should "return None if no user found" in {
    val fixtures = buildFixtures()
    import fixtures._

    when(discussionClient.findDiscussionUser(userId)) thenReturn Future.successful(None)
    when(discussionClient.profileHasAtLeastOneComment(userId)) thenReturn Future.successful(false)

    val discussionApiService = new DiscussionApiService(discussionClient)
    discussionApiService.findDiscussionUserFilterCommented(userId).map(_ shouldBe None)
  }

}
