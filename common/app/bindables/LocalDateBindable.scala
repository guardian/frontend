package bindables

import common.GuLogging
import org.joda.time.LocalDate
import org.joda.time.format.DateTimeFormat
import play.api.mvc.PathBindable

import scala.util.{Failure, Success, Try}

class LocalDateBindable extends PathBindable[LocalDate] with GuLogging {
  val Format = "yyyy-MM-dd"

  override def bind(key: String, value: String): Either[String, LocalDate] = {
    Try {
      Option(LocalDate.parse(value, DateTimeFormat.forPattern(Format))).get
    } match {
      case Success(date)  => Right(date)
      case Failure(error) =>
        log.error(s"Could not bind $key to $value", error)
        Left(error.getMessage)
    }
  }

  override def unbind(key: String, value: LocalDate): String = {
    value.toString(Format)
  }
}
