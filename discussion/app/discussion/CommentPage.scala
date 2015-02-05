package discussion

import _root_.model.Page
import discussion.model.DiscussionComments

trait CommentPage extends Page {
  val discussionComments: DiscussionComments

  override lazy val url = s"/discussion/$orderBy$id"
  override val pagination = Some(discussionComments.pagination)
  lazy val discussion = discussionComments.discussion
  lazy val comments = discussionComments.comments
  lazy val commentPageTitle = discussion.title
  lazy val commentCount = discussionComments.commentCount
  lazy val topLevelCommentCount = discussionComments.topLevelCommentCount
  lazy val commenterCount = discussionComments.commenterCount
  lazy val contentUrl = discussion.webUrl
  lazy val orderBy = discussionComments.orderBy
  lazy val isClosedForRecommendation = discussion.isClosedForRecommendation
  lazy val switches = discussionComments.switches
  lazy val isLargeDiscussion = commentCount > 1000
}

case class ThreadedCommentPage(val discussionComments: DiscussionComments)
  extends Page(
    id = discussionComments.discussion.key,
    section = "Global",
    webTitle = discussionComments.discussion.title,
    analyticsName = s"GFE:Article:Comment discussion threaded page ${discussionComments.pagination.currentPage}"
  ) with CommentPage

case class UnthreadedCommentPage(val discussionComments: DiscussionComments)
  extends Page(
    id = discussionComments.discussion.key,
    section = "Discussion",
    webTitle = discussionComments.discussion.title,
    analyticsName = s"GFE:Article:Comment discussion unthreaded page ${discussionComments.pagination.currentPage}"
  ) with CommentPage

