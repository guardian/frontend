package model

import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat
import scala.math.abs

object `package` {

  implicit def content2Is(content: ApiContent) = new {
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
    lazy val isGallery: Boolean = content.tags exists { _.id == "type/gallery" }
  }

  implicit def any2In[A](a: A) = new {
    def in(as: Set[A]): Boolean = as contains a
  }

  implicit def int2RichInt(i: Int) = new {
    def distanceFrom(j: Int) = abs(j - i)
    def in(range: Range): Boolean = range contains i
  }

  implicit def dateTime2ToISODateTimeStrings(date: DateTime) = new {
    lazy val toISODateTimeString: String = date.toString(ISODateTimeFormat.dateTime)
    lazy val toISODateTimeNoMillisString: String = date.toString(ISODateTimeFormat.dateTimeNoMillis)
  }

  implicit def ISODateTimeStringNoMillis2DateTime(s: String) = new {
    lazy val parseISODateTimeNoMillis = ISODateTimeFormat.dateTimeNoMillis.parseDateTime(s)
  }
}