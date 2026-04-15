package cricket.implicits

import com.github.nscala_time.time.Imports.DateTimeZone
import football.datetime.DateHelpers
import model.ContentType
import scala.language.implicitConversions

object Cricket {
  implicit class ContentHelper(c: ContentType) {
    lazy val matchReport = c.tags.tags.exists(_.id == "tone/matchreports")

    lazy val isLiveCricket =
      c.tags.tags.exists(_.id == "tone/minutebyminute") && c.tags.tags.exists(
        _.id == "sport/over-by-over-reports",
      ) && c.isLiveBlogType

    lazy val isArticleType = c.metadata.contentType.exists(_.name == "Article")
    lazy val isLiveBlogType = c.metadata.contentType.exists(_.name == "LiveBlog")

    lazy val webPublicationDate =
      DateHelpers.asZonedDateTime(c.trail.webPublicationDate.withZone(DateTimeZone.forID("Europe/London")))

    def isPage(currentPage: String): Boolean = c.metadata.id == currentPage
  }
}
