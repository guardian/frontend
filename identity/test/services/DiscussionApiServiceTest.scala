package services

import clients.{DiscussionClient, DiscussionProfile, DiscussionProfileResponse, DiscussionProfileStats}
import org.mockito.Mockito._
import org.scalatest.AsyncFlatSpec
import org.scalatest.Matchers._
import org.scalatest.mockito.MockitoSugar

import scala.concurrent.Future

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
    when(discussionClient.findProfileStats(userId)) thenReturn Future.successful(Some(profileStats))

    val discussionApiService = new DiscussionApiService(discussionClient)
    discussionApiService.findDiscussionUserFilterCommented(userId).map(_ shouldBe Some(discussionProfile))
  }

  "findDiscussionUserFilterCommented" should "return None if there are no comments" in {
    val fixtures = buildFixtures()
    import fixtures._

    when(discussionClient.findDiscussionUser(userId)) thenReturn Future.successful(Some(discussionProfileResponse))
    when(discussionClient.findProfileStats(userId)) thenReturn Future.successful(Some(profileStats.copy(comments = 0)))

    val discussionApiService = new DiscussionApiService(discussionClient)
    discussionApiService.findDiscussionUserFilterCommented(userId).map(_ shouldBe None)
  }

  "findDiscussionUserFilterCommented" should "return None if no user found" in {
    val fixtures = buildFixtures()
    import fixtures._

    when(discussionClient.findDiscussionUser(userId)) thenReturn Future.successful(None)
    when(discussionClient.findProfileStats(userId)) thenReturn Future.successful(None)

    val discussionApiService = new DiscussionApiService(discussionClient)
    discussionApiService.findDiscussionUserFilterCommented(userId).map(_ shouldBe None)
  }

}
