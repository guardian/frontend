package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, MediaAsset }
import common.Edition
import org.joda.time.format.ISODateTimeFormat
import scala.math.abs

object `package` {

  implicit class ApiContent2Is(content: ApiContent) {
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
    lazy val isSudoku: Boolean = content.tags exists { _.id == "type/sudoku" }
    lazy val isGallery: Boolean = content.tags exists { _.id == "type/gallery" }
    lazy val isVideo: Boolean = content.tags exists { _.id == "type/video" }
    lazy val isPoll: Boolean = content.tags exists { _.id == "type/poll" }
    lazy val isImageContent: Boolean = content.tags exists { tag => List("type/cartoon", "type/picture", "type/graphic").contains(tag.id) }
    lazy val isInteractive: Boolean = content.tags exists { _.id == "type/interactive" }
    lazy val isLiveBlog: Boolean = content.tags.exists(t => Tags.liveMappings.contains(t.id))
    lazy val isComment = content.tags.exists(t => Tags.commentMappings.contains(t.id))
    lazy val isFeature = content.tags.exists(t => Tags.featureMappings.contains(t.id))
    lazy val isReview = content.tags.exists(t => Tags.reviewMappings.contains(t.id))
  }

  implicit class Content2Is(content: Content) {
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
    lazy val isSudoku: Boolean = content.tags exists { _.id == "type/sudoku" }
    lazy val isGallery: Boolean = content.tags exists { _.id == "type/gallery" }
    lazy val isVideo: Boolean = content.tags exists { _.id == "type/video" }
    lazy val isPoll: Boolean = content.tags exists { _.id == "type/poll" }
    lazy val isImageContent: Boolean = content.tags exists { tag => List("type/cartoon", "type/picture", "type/graphic").contains(tag.id) }
    lazy val isInteractive: Boolean = content.tags exists { _.id == "type/interactive" }
  }

  implicit class Media2rich(a: MediaAsset) {
    lazy val safeFields = a.fields.getOrElse(Map.empty)
  }

  implicit class Any2In[A](a: A) {
    def in(as: Set[A]): Boolean = as contains a
  }

  implicit class Int2RichInt(i: Int) {
    def distanceFrom(j: Int) = abs(j - i)
    def in(range: Range): Boolean = range contains i
  }

  lazy val DateTimeWithMillis = """.*\d\d:\d\d\.(\d+)[Z|\+].*""".r

  implicit class ISODateTimeStringNoMillis2DateTime(s: String) {
    lazy val parseISODateTime = s match {
      case DateTimeWithMillis(_) => ISODateTimeFormat.dateTime.withZone(Edition.defaultEdition.timezone).parseDateTime(s)
      case _ => ISODateTimeFormat.dateTimeNoMillis.withZone(Edition.defaultEdition.timezone).parseDateTime(s)
    }
  }
}
