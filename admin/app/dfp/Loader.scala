package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder.SUGGESTED_PAGE_LIMIT
import com.google.api.ads.dfp.axis.v201508._
import common.Logging

import scala.annotation.tailrec

object Loader extends Logging {

  def load[T](statementBuilder: StatementBuilder)(loadPage: Statement => (Array[T], Int)): Seq[T] = {

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

    statementBuilder.limit(SUGGESTED_PAGE_LIMIT)
    load(Nil)
  }
}
