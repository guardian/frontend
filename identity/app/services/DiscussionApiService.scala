package services

import clients.{DiscussionClient, DiscussionProfile, DiscussionProfileResponse, DiscussionProfileStats}
import utils.SafeLogging

import scala.concurrent.{ExecutionContext, Future}

class DiscussionApiService(discussionClient: DiscussionClient)(implicit executionContext: ExecutionContext)
    extends SafeLogging {

  def findDiscussionUserFilterCommented(userId: String): Future[Option[DiscussionProfile]] = {

    val discussionProfileResponseF: Future[Option[DiscussionProfileResponse]] =
      discussionClient.findDiscussionUser(userId)
    val discussionStatsF: Future[Option[DiscussionProfileStats]] = discussionClient.findProfileStats(userId)

    for {
      discussionProfileResponse <- discussionProfileResponseF
      discussionStats <- discussionStatsF
    } yield (discussionProfileResponse, discussionStats) match {
      case (Some(user), Some(stats)) if stats.comments > 0 =>
        Some(user.userProfile)
      case _ =>
        None
    }

  }
}
