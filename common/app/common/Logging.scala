package common

import play.api.Logger
import org.apache.commons.lang.exception.ExceptionUtils
import net.logstash.logback.marker.LogstashMarker
import net.logstash.logback.marker.Markers._
import scala.collection.JavaConverters._

trait Logging {

  lazy implicit val log = Logger(getClass)

  protected def logException(e: Exception) = {
    log.error(ExceptionUtils.getStackTrace(e))
  }

  /*
   * Passing custom fields into the logs
   * Fields are passed as a map (fieldName -> fieldValue)
   * Supported field value types: String, Int and Double
   */
  sealed trait CanBeLogField[T]
  implicit object StringField extends CanBeLogField[String]
  implicit object IntField extends CanBeLogField[Int]
  implicit object DoubleField extends CanBeLogField[Double]

  private def customFieldMarkers[T: CanBeLogField](fields: Map[String, T]) : LogstashMarker = {
    appendEntries(fields.asJava)
  }

  def logInfoWithCustomFields[T: CanBeLogField](message: String, customFields: Map[String, T]): Unit = {
    log.logger.info(customFieldMarkers(customFields), message)
  }
  def logWarningWithCustomFields[T: CanBeLogField](message: String, error: Throwable, customFields: Map[String, T]): Unit = {
    log.logger.warn(customFieldMarkers(customFields), message, error)
  }
  def logErrorWithCustomFields[T: CanBeLogField](message: String, error: Throwable, customFields: Map[String, T]): Unit = {
    log.logger.error(customFieldMarkers(customFields), message, error)
  }
}
