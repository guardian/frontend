package common

import common.LoggingField._
import play.api.Logger
import org.apache.commons.lang.exception.ExceptionUtils
import net.logstash.logback.marker.LogstashMarker
import net.logstash.logback.marker.Markers._

import scala.collection.JavaConverters._
import scala.concurrent.{ExecutionContext, Future}
import scala.language.implicitConversions
import scala.util.control.NonFatal
import scala.util.{Failure, Success, Try}

trait Logging {

  lazy implicit val log = Logger(getClass)

  protected def logException(e: Exception): Unit = {
    log.error(ExceptionUtils.getStackTrace(e))
  }

  def logInfoWithCustomFields(message: String, customFields: List[LogField]): Unit = {
    log.logger.info(customFieldMarkers(customFields), message)
  }
  def logWarningWithCustomFields(message: String, error: Throwable, customFields: List[LogField]): Unit = {
    log.logger.warn(customFieldMarkers(customFields), message, error)
  }
  def logErrorWithCustomFields(message: String, error: Throwable, customFields: List[LogField]): Unit = {
    log.logger.error(customFieldMarkers(customFields), message, error)
  }

  // Transparent error logging on exceptions: log context and exception on error, and pass on the exception
  def errorLoggingF[A](context: String)(task: => Future[A])(implicit ec: ExecutionContext): Future[A] = {
    Try(task) match {
      case Success(f) => f.failed.foreach(Logger.error(context, _)) ; f
      case Failure(e) => Logger.error(context, e) ; throw e
    }
  }

  def errorLogging[A](message: String)(block: => A): A = {
    Try(block) match {
      case Success(result) => result
      case Failure(e) => Logger.error(message, e) ; throw e
    }
  }
}

object LoggingField {
  /*
   * Passing custom fields into the logs
   * Fields are passed as a map (fieldName -> fieldValue)
   * Supported field value types: String, Int and Double
   */

  sealed trait LogField {
    def name: String
  }
  case class LogFieldInt(name: String, value: Int) extends LogField
  case class LogFieldString(name: String, value: String) extends LogField
  case class LogFieldDouble(name: String, value: Double) extends LogField
  case class LogFieldLong(name: String, value: Long) extends LogField

  implicit def tupleToLogFieldInt(t: (String, Int)): LogFieldInt = LogFieldInt(t._1, t._2)
  implicit def tupleToLogFieldString(t: (String, String)): LogFieldString = LogFieldString(t._1, t._2)
  implicit def tupleToLogFieldDouble(t: (String, Double)): LogFieldDouble = LogFieldDouble(t._1, t._2)
  implicit def tupleToLogFieldLong(t: (String, Long)): LogFieldLong = LogFieldLong(t._1, t._2)

  def customFieldMarkers(fields: List[LogField]) : LogstashMarker = {
    val fieldsMap = fields.map {
      case LogFieldInt(n, v) => (n, v)
      case LogFieldString(n, v) => (n, v)
      case LogFieldDouble(n, v) => (n, v)
      case LogFieldLong(n, v) => (n, v)
    }
      .toMap
      .asJava
    appendEntries(fieldsMap)
  }
}
