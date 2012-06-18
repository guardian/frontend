package common

import com.gu.openplatform.contentapi.ApiError
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat
import play.api.Logger
import scala.math.abs

object `package` {

  implicit def content2Is(content: ApiContent) = new {
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
    lazy val isGallery: Boolean = content.tags exists { _.id == "type/gallery" }
  }

  implicit def string2ToOptions(s: String) = new {
    lazy val toIntOption: Option[Int] = try {
      Some(s.toInt)
    } catch {
      case _ => None
    }

    lazy val toBooleanOption: Option[Boolean] = try {
      Some(s.toBoolean)
    } catch {
      case _ => None
    }
  }

  implicit def string2Dequote(s: String) = new {
    lazy val dequote = s.replace("\"", "")
  }

  implicit def any2In[A](a: A) = new {
    def in(as: Set[A]): Boolean = as contains a
  }

  implicit def int2RichInt(i: Int) = new {
    def distanceFrom(j: Int) = abs(j - i)
    def in(range: Range): Boolean = range contains i
  }

  implicit def dateTime2ToISODateTimeString(date: DateTime) = new {
    lazy val toISODateTimeString: String = date.toString(ISODateTimeFormat.dateTime)
  }

  implicit def dateTime2ToISODateTimeNoMillisString(date: DateTime) = new {
    lazy val toISODateTimeNoMillisString: String = date.toString(ISODateTimeFormat.dateTimeNoMillis)
  }

  implicit def iSODateTimeStringNoMillis2DateTime(s: String) = new {
    lazy val parseISODateTimeNoMillis = ISODateTimeFormat.dateTimeNoMillis.parseDateTime(s)
  }

  def suppressApi404[T](block: => Option[T])(implicit log: Logger): Option[T] = {
    try {
      block
    } catch {
      case ApiError(404, message) =>
        log.info("Got a 404 while calling content api: " + message)
        None
    }
  }
}