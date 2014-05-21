package discussion

import _root_.model.Page
import discussion.model.{DiscussionComments, Comment, Switch}
import play.api.libs.json.JsObject

case class CommentPage(discussionComments: DiscussionComments)
  extends Page(
    id = discussionComments.discussion.key,
    section = "Global",
    webTitle = discussionComments.discussion.title,
    analyticsName = s"GFE:Article:Comment discussion page ${discussionComments.pagination.currentPage}"
  ) {

  lazy val discussion = discussionComments.discussion
  lazy val comments = discussionComments.comments
  lazy val paging = discussionComments.pagination
  lazy val commentPageTitle = discussion.title
  lazy val commentCount = discussionComments.commentCount
  lazy val topLevelCommentCount = discussionComments.topLevelCommentCount
  lazy val commenterCount = discussionComments.commenterCount
  lazy val contentUrl = discussion.webUrl
  lazy val currentPage = paging.currentPage
  lazy val pages = paging.pages
  lazy val orderBy = paging.orderBy
  lazy val isClosedForRecommendation = discussion.isClosedForRecommendation
  lazy val switches = discussionComments.switches

  lazy val hasMore = paging.hasMore
}
