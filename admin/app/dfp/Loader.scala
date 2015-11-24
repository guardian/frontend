package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder.SUGGESTED_PAGE_LIMIT
import com.google.api.ads.dfp.axis.v201508._
import common.Logging

import scala.annotation.tailrec

object Loader extends Logging {

  def load[T](statementBuilder: StatementBuilder)(loadPage: Statement => (Array[T], Int)): Seq[T] = {

    def logApiException(e: ApiException): Unit = {
      e.getErrors foreach { err =>
        val reasonMsg = err match {
          case freqCapErr: FrequencyCapError => s", with the reason '${freqCapErr.getReason}'"
          case notNullErr: NotNullError => s", with the reason '${notNullErr.getReason}'"
          case _ => ""
        }
        val path = err.getFieldPath
        val trigger = err.getTrigger
        val msg = s"'${err.getErrorString}'$reasonMsg"
        log.error(
          s"API loading exception in field '$path', caused by an invalid value '$trigger', with the error message $msg"
        )
      }
    }

    @tailrec
    def load(soFar: Seq[T]): Seq[T] = {
      val (pageOfResults, totalResultSetSize) = loadPage(statementBuilder.toStatement)
      val resultsSoFar = Option(pageOfResults).map(soFar ++ _).getOrElse(soFar)
      if (resultsSoFar.size >= totalResultSetSize) {
        resultsSoFar
      } else {
        statementBuilder.increaseOffsetBy(SUGGESTED_PAGE_LIMIT)
        load(resultsSoFar)
      }
    }

    try {
      statementBuilder.limit(SUGGESTED_PAGE_LIMIT)
      load(Nil)
    } catch {
      case e: ApiException =>
        logApiException(e)
        Nil
      case e: Exception =>
        log.error(s"Exception fetching: ${e.getMessage}")
        Nil
    }
  }
}
