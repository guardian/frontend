package dfp

import com.google.api.ads.admanager.axis.utils.v202108.StatementBuilder
import com.google.api.ads.admanager.axis.utils.v202108.StatementBuilder.SUGGESTED_PAGE_LIMIT
import com.google.api.ads.admanager.axis.v202108._

import scala.annotation.tailrec

object Reader {

  def read[T](statementBuilder: StatementBuilder)(readPage: Statement => (Array[T], Int)): Seq[T] = {

    @tailrec
    def read(soFar: Seq[T]): Seq[T] = {
      val (pageOfResults, totalResultSetSize) = readPage(statementBuilder.toStatement)
      val resultsSoFar = Option(pageOfResults).map(soFar ++ _).getOrElse(soFar)
      if (resultsSoFar.size >= totalResultSetSize) {
        resultsSoFar
      } else {
        statementBuilder.increaseOffsetBy(SUGGESTED_PAGE_LIMIT)
        read(resultsSoFar)
      }
    }

    statementBuilder.limit(SUGGESTED_PAGE_LIMIT)
    read(Nil)
  }
}
