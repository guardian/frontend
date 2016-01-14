package discussion.model

case class DiscussionAbuseReport(categoryId: Int, commentId: Int, reason: Option[String], email: Option[String])
