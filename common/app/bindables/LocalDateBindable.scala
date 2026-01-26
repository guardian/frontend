package bindables

import common.GuLogging
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import play.api.mvc.PathBindable

import scala.util.{Failure, Success, Try}

class LocalDateBindable extends PathBindable[LocalDate] with GuLogging {
  val Format = "yyyy-MM-dd"
  val formatter: DateTimeFormatter = DateTimeFormatter.ofPattern(Format)

  override def bind(key: String, value: String): Either[String, LocalDate] = {
    Try {
      LocalDate.parse(value, formatter)
    } match {
      case Success(date)  => Right(date)
      case Failure(error) =>
        log.error(s"Could not bind $key to $value", error)
        Left(error.getMessage)
    }
  }

  override def unbind(key: String, value: LocalDate): String = {
    value.format(formatter)
  }
}
