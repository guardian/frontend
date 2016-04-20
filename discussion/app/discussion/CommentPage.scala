package discussion

import _root_.model.{MetaData, StandalonePage, Page}
import discussion.model.DiscussionComments

trait CommentPage extends StandalonePage {
  val discussionComments: DiscussionComments

  protected val id = discussionComments.discussion.key
  lazy val discussion = discussionComments.discussion
  lazy val comments = discussionComments.comments
  lazy val commentPageTitle = discussion.title
  lazy val commentCount = discussionComments.commentCount
  lazy val topLevelCommentCount = discussionComments.topLevelCommentCount
  lazy val commenterCount = discussionComments.commenterCount
  lazy val contentUrl = discussion.webUrl
  lazy val isClosedForRecommendation = discussion.isClosedForRecommendation
  lazy val switches = discussionComments.switches
  lazy val isLargeDiscussion = commentCount > 1000
}

case class ThreadedCommentPage(val discussionComments: DiscussionComments)
  extends StandalonePage with CommentPage {

    override val metadata = MetaData.make(
      id = id,
      section = "Global",
      webTitle = discussionComments.discussion.title,
      analyticsName = s"GFE:Article:Comment discussion threaded page ${discussionComments.pagination.currentPage}",
      url = Some(s"/discussion$id"),
      pagination = Some(discussionComments.pagination))
}

case class UnthreadedCommentPage(val discussionComments: DiscussionComments)
  extends StandalonePage with CommentPage {

    override val metadata = MetaData.make(
      id = id,
      section = "Discussion",
      webTitle = discussionComments.discussion.title,
      analyticsName = s"GFE:Article:Comment discussion unthreaded page ${discussionComments.pagination.currentPage}",
      url = Some(s"/discussion$id"),
      pagination = Some(discussionComments.pagination))
}

