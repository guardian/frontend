package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, MediaAsset }
import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, ISODateTimeFormat}
import scala.math.abs
import org.scala_tools.time.Imports._
import org.scala_tools.time.TypeImports.DateTimeFormat
import org.scala_tools.time.StaticForwarderImports.DateTimeFormat

object `package` {

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

  lazy val DateTimeWithMillis = """.*\d\d:\d\d\.(\d+)[Z|\+].*""".r

  implicit class ISODateTimeStringNoMillis2DateTime(s: String) {
    lazy val parseISODateTime = s match {
      case DateTimeWithMillis(_) => ISODateTimeFormat.dateTime.parseDateTime(s)
      case _ => ISODateTimeFormat.dateTimeNoMillis.parseDateTime(s)
    }
  }
}
