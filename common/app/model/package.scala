package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, MediaAsset }
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat
import scala.math.abs
import org.scala_tools.time.Imports._

object `package` {

  //http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
  private val HTTPDateFormat = DateTimeFormat.forPattern("EEE, dd MMM yyyy HH:mm:ss 'GMT'").withZone(DateTimeZone.UTC)

  implicit class ApiContent2Is(content: ApiContent) {
    lazy val isLiveBlog: Boolean = content.tags exists { _.id == "tone/minutebyminute" }
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
    lazy val isSudoku: Boolean = content.tags exists { _.id == "type/sudoku" }
    lazy val isGallery: Boolean = content.tags exists { _.id == "type/gallery" }
    lazy val isVideo: Boolean = content.tags exists { _.id == "type/video" }
    lazy val isPoll: Boolean = content.tags exists { _.id == "type/poll" }
    lazy val isImageContent: Boolean = content.tags exists { tag => List("type/cartoon", "type/picture", "type/graphic").contains(tag.id) }
  }

  implicit class Content2Is(content: Content) {
    lazy val isLiveBlog: Boolean = content.tags exists { _.id == "tone/minutebyminute" }
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
    lazy val isSudoku: Boolean = content.tags exists { _.id == "type/sudoku" }
    lazy val isGallery: Boolean = content.tags exists { _.id == "type/gallery" }
    lazy val isVideo: Boolean = content.tags exists { _.id == "type/video" }
    lazy val isPoll: Boolean = content.tags exists { _.id == "type/poll" }
    lazy val isImageContent: Boolean = content.tags exists { tag => List("type/cartoon", "type/picture", "type/graphic").contains(tag.id) }
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

  implicit class DateTime2ToCommonDateFormats(date: DateTime) {
    lazy val toISODateTimeString: String = date.toString(ISODateTimeFormat.dateTime)
    lazy val toISODateTimeNoMillisString: String = date.toString(ISODateTimeFormat.dateTimeNoMillis)
    lazy val toHttpDateTimeString: String = date.toString(HTTPDateFormat)
  }

  lazy val DateTimeWithMillis = """.*\d\d:\d\d\.(\d+)\+.*""".r

  implicit class ISODateTimeStringNoMillis2DateTime(s: String) {
    lazy val parseISODateTimeNoMillis = s match {
      case DateTimeWithMillis(_) => ISODateTimeFormat.dateTime.parseDateTime(s)
      case _ => ISODateTimeFormat.dateTimeNoMillis.parseDateTime(s)
    }
  }
}
