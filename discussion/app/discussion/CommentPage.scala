package discussion

import _root_.model.Page
import model.{Comment, Switch}
import play.api.libs.json.JsObject

case class CommentPage(
                        override val id: String,
                        title: String,
                        comments: Seq[Comment],
                        commentCount: Int,
                        topLevelCommentCount: Int,
                        commenterCount: Int,
                        contentUrl: String,
                        currentPage: Int,
                        pages: Int,
                        isClosedForRecommendation: Boolean,
                        switches: Seq[Switch]
                        ) extends Page(id = id, section = "Global", webTitle = title, analyticsName = s"GFE:Article:Comment discussion page $currentPage") {

  lazy val hasMore: Boolean = currentPage < pages
}
