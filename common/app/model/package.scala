package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent, MediaAsset }
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat
import scala.math.abs
import org.scala_tools.time.Imports._

object `package` {

  //http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
  private val HTTPDateFormat = DateTimeFormat.forPattern("EEE, dd MMM yyyy HH:mm:ss 'GMT'").withZone(DateTimeZone.UTC)

  implicit def apiContent2Is(content: ApiContent) = new {
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
    lazy val isGallery: Boolean = content.tags exists { _.id == "type/gallery" }
    lazy val isVideo: Boolean = content.tags exists { _.id == "type/video" }
  }

  implicit def content2Is(content: Content) = new {
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
    lazy val isGallery: Boolean = content.tags exists { _.id == "type/gallery" }
    lazy val isVideo: Boolean = content.tags exists { _.id == "type/video" }
  }

  implicit def media2rich(a: MediaAsset) = new {
    lazy val safeFields = a.fields.getOrElse(Map.empty)
  }

  implicit def any2In[A](a: A) = new {
    def in(as: Set[A]): Boolean = as contains a
  }

  implicit def int2RichInt(i: Int) = new {
    def distanceFrom(j: Int) = abs(j - i)
    def in(range: Range): Boolean = range contains i
  }

  implicit def dateTime2ToCommonDateFormats(date: DateTime) = new {
    lazy val toISODateTimeString: String = date.toString(ISODateTimeFormat.dateTime)
    lazy val toISODateTimeNoMillisString: String = date.toString(ISODateTimeFormat.dateTimeNoMillis)
    lazy val toHttpDateTimeString: String = date.toString(HTTPDateFormat)
  }

  implicit def ISODateTimeStringNoMillis2DateTime(s: String) = new {
    lazy val parseISODateTimeNoMillis = ISODateTimeFormat.dateTimeNoMillis.parseDateTime(s)
  }
}