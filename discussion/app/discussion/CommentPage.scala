package discussion

import _root_.model.Page
import model.Comment

case class CommentPage(
                        override val id: String,
                        title: String,
                        comments: Seq[Comment],
                        contentUrl: String,
                        currentPage: Int,
                        pages: Int,
                        isClosedForRecommendation: Boolean
                        ) extends Page(id = id, section = "Global", webTitle = title, analyticsName = s"GFE:Article:Comment discussion page $currentPage") {

  lazy val hasMore: Boolean = currentPage < pages
}
