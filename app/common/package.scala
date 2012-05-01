package common

import com.gu.openplatform.contentapi.ApiError
import com.gu.openplatform.contentapi.model.{ Content => ApiContent }
import play.api.Logger
import java.util.Properties
import scala.collection.JavaConversions._

object `package` {
  implicit def string2ToIntOption(s: String) = new {
    lazy val toIntOption: Option[Int] = try {
      Some(s.toInt)
    } catch {
      case _ => None
    }
  }

  implicit def content2IsArticle(content: ApiContent) = new {
    lazy val isArticle: Boolean = content.tags exists { _.id == "type/article" }
  }

  implicit def properties2ToMap(properties: Properties) = new {
    def toMap: Map[String, String] = properties.entrySet map { entry =>
      (entry.getKey.toString, entry.getValue.toString)
    } toMap
  }

  implicit def listOfMaps2DuplicateKeys[K, V](maps: List[Map[K, V]]) = new {
    def duplicateKeys: Set[K] = {
      val keys = (maps flatMap { _.keySet })
      val keyInstances = keys groupBy { k => k }
      (keyInstances filter { case (key, instances) => instances.length > 1 }).keySet
    }
  }

  def suppressApi404[T](block: => Option[T])(implicit log: Logger): Option[T] = {
    try {
      block
    } catch {
      case ApiError(404, _) =>
        log.info("Got a 404 while calling content api")
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
}