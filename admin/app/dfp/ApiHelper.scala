package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder.SUGGESTED_PAGE_LIMIT
import com.google.api.ads.dfp.axis.v201508._
import common.Logging
import org.joda.time.{DateTime => JodaDateTime, DateTimeZone}

import scala.annotation.tailrec

object ApiHelper extends Logging {

  def fetch[T](statementBuilder: StatementBuilder)
              (fetchPage: Statement => (Array[T], Int)): Seq[T] = {

    @tailrec
    def fetch(soFar: Seq[T]): Seq[T] = {
      val (pageOfResults, totalResultSetSize) = fetchPage(statementBuilder.toStatement)
      val resultsSoFar = Option(pageOfResults).map(soFar ++ _).getOrElse(soFar)
      if (resultsSoFar.size >= totalResultSetSize) {
        resultsSoFar
      } else {
        statementBuilder.increaseOffsetBy(SUGGESTED_PAGE_LIMIT)
        fetch(resultsSoFar)
      }
    }

    try {
      statementBuilder.limit(SUGGESTED_PAGE_LIMIT)
      fetch(Nil)
    } catch {

      case e: ApiException =>
        e.getErrors foreach { err =>
          val reasonMsg = err match {
            case freqCapErr: FrequencyCapError => s", with the reason '${freqCapErr.getReason}'"
            case notNullErr: NotNullError => s", with the reason '${notNullErr.getReason}'"
            case _ => ""
          }
          log.error(s"API Exception fetching in the field '${err.getFieldPath}', " +
            s"caused by an invalid value '${err.getTrigger}', with the error message '${
              err
                .getErrorString
            }'" +
            reasonMsg)
        }
        Nil

      case e: Exception =>
        log.error(s"Exception fetching: ${e.getMessage}")
        Nil
    }
  }

  def toJodaTime(time: DateTime): JodaDateTime = {
    val date = time.getDate
    new JodaDateTime(
      date.getYear,
      date.getMonth,
      date.getDay,
      time.getHour,
      time.getMinute,
      time.getSecond,
      DateTimeZone.forID(time.getTimeZoneID)
    )
  }
}
