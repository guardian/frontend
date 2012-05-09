package common

import com.gu.openplatform.contentapi.ApiError
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import java.net.URL
import java.util.Properties
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat
import play.api.Logger
import scala.collection.JavaConversions._
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

  implicit def int2DistanceFrom(i: Int) = new {
    def distanceFrom(j: Int) = abs(j - i)
  }

  implicit def int2In(i: Int) = new {
    def in(range: Range): Boolean = range contains i
  }

  implicit def listOfMaps2DuplicateKeys[K, V](maps: List[Map[K, V]]) = new {
    def duplicateKeys: Set[K] = {
      val keys = (maps flatMap { _.keySet })
      val keyInstances = keys groupBy { k => k }
      (keyInstances filter { case (key, instances) => instances.length > 1 }).keySet
    }
  }

  implicit def dateTime2ToISODateTimeString(date: DateTime) = new {
    lazy val toISODateTimeString: String = date.toString(ISODateTimeFormat.dateTime)
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

  def using[S <: { def close() }, T](closable: S)(block: S => T): T = {
    try {
      block(closable)
    } finally {
      closable.close()
    }
  }

  def loadProperties(url: URL): Map[String, String] = {
    val properties = new Properties()
    using(url.openStream) { properties load _ }
    properties.toMap
  }
}