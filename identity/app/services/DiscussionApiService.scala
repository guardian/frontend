package services

import clients.{DiscussionClient, DiscussionProfile, DiscussionProfileResponse, DiscussionProfileStats}
import utils.SafeLogging

import scala.concurrent.{ExecutionContext, Future}

class DiscussionApiService(discussionClient: DiscussionClient)(implicit executionContext: ExecutionContext)
    extends SafeLogging {

  def findDiscussionUserFilterCommented(userId: String): Future[Option[DiscussionProfile]] = {

    val discussionProfileResponseF: Future[Option[DiscussionProfileResponse]] =
      discussionClient.findDiscussionUser(userId)
    val profileHasAtLeastOneCommentF = discussionClient.profileHasAtLeastOneComment(userId)

    for {
      discussionProfileResponse <- discussionProfileResponseF
      profileHasAtLeastOneComment <- profileHasAtLeastOneCommentF
    } yield (discussionProfileResponse, profileHasAtLeastOneComment) match {
      case (Some(user), true) =>
        Some(user.userProfile)
      case _ =>
        None
    }

  }
}
