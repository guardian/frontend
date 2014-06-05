package dfp

import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.axis.v201403.{LineItem => DfpApiLineItem}
import common.Logging
import com.google.api.ads.dfp.lib.client.DfpSession
import com.google.api.ads.dfp.axis.factory.DfpServices

object DfpApiWrapper extends Logging {

  private lazy val dfpServices = new DfpServices()

  private def lineItemService(session: DfpSession): LineItemServiceInterface =
    dfpServices.get(session, classOf[LineItemServiceInterface])

  private def customTargetingService(session: DfpSession): CustomTargetingServiceInterface =
    dfpServices.get(session, classOf[CustomTargetingServiceInterface])

  def fetchLineItems(session: DfpSession, statementBuilder: StatementBuilder): Seq[DfpApiLineItem] = {

    val service = lineItemService(session)

    def fetch(soFar: Seq[DfpApiLineItem]): Seq[DfpApiLineItem] = {
      val page = service.getLineItemsByStatement(statementBuilder.toStatement)
      val pageResults = Option(page.getResults) map (_.toSeq) getOrElse Nil
      val totalResultSetSize = page.getTotalResultSetSize

      if (Option(statementBuilder.getOffset) exists (_ > totalResultSetSize)) {
        soFar
      } else {
        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
        fetch(soFar ++ pageResults)
      }
    }

    try {
      fetch(Nil)
    } catch {
      case e: Exception =>
        log.error(s"Exception fetching line items: $e")
        Nil
    }
  }

  def fetchCustomTargetingKeys(session: DfpSession, statementBuilder: StatementBuilder): Seq[CustomTargetingKey] = {

    val service = customTargetingService(session)

    def fetch(soFar: Seq[CustomTargetingKey]): Seq[CustomTargetingKey] = {
      val page = service.getCustomTargetingKeysByStatement(statementBuilder.toStatement)
      val pageResults = Option(page.getResults) map (_.toSeq) getOrElse Nil
      val totalResultSetSize = page.getTotalResultSetSize

      if (Option(statementBuilder.getOffset) exists (_ > totalResultSetSize)) {
        soFar
      } else {
        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
        fetch(soFar ++ pageResults)
      }
    }

    try {
      fetch(Nil)
    } catch {
      case e: Exception =>
        log.error(s"Exception fetching custom targeting keys: $e")
        Nil
    }
  }

  def fetchCustomTargetingValues(session: DfpSession, statementBuilder: StatementBuilder): Seq[CustomTargetingValue] = {

    val service = customTargetingService(session)

    def fetch(soFar: Seq[CustomTargetingValue]): Seq[CustomTargetingValue] = {
      val page = service.getCustomTargetingValuesByStatement(statementBuilder.toStatement)
      val pageResults = Option(page.getResults) map (_.toSeq) getOrElse Nil
      val totalResultSetSize = page.getTotalResultSetSize

      if (Option(statementBuilder.getOffset) exists (_ > totalResultSetSize)) {
        soFar
      } else {
        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
        fetch(soFar ++ pageResults)
      }
    }

    try {
      fetch(Nil)
    } catch {
      case e: Exception =>
        log.error(s"Exception fetching custom targeting values: $e")
        Nil
    }
  }
}
