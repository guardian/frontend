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

  private def inventoryService(session: DfpSession): InventoryServiceInterface =
    dfpServices.get(session, classOf[InventoryServiceInterface])

  def fetchLineItems(session: DfpSession, statementBuilder: StatementBuilder): Seq[DfpApiLineItem] = {

    val service = lineItemService(session)
    statementBuilder.limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)

    def fetch(soFar: Seq[DfpApiLineItem]): Seq[DfpApiLineItem] = {
      val page = service.getLineItemsByStatement(statementBuilder.toStatement)
      val pageResults = Option(page.getResults) map (_.toSeq) getOrElse Nil
      val totalResultSetSize = page.getTotalResultSetSize
      val resultsSoFar = soFar ++ pageResults

      if (resultsSoFar.size < totalResultSetSize) {
        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
        fetch(resultsSoFar)
      } else {
        resultsSoFar
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
    statementBuilder.limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)

    def fetch(soFar: Seq[CustomTargetingKey]): Seq[CustomTargetingKey] = {
      val page = service.getCustomTargetingKeysByStatement(statementBuilder.toStatement)
      val pageResults = Option(page.getResults) map (_.toSeq) getOrElse Nil
      val totalResultSetSize = page.getTotalResultSetSize
      val resultsSoFar = soFar ++ pageResults

      if (resultsSoFar.size < totalResultSetSize) {
        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
        fetch(resultsSoFar)
      } else {
        resultsSoFar
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
    statementBuilder.limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)

    def fetch(soFar: Seq[CustomTargetingValue]): Seq[CustomTargetingValue] = {
      val page = service.getCustomTargetingValuesByStatement(statementBuilder.toStatement)
      val pageResults = Option(page.getResults) map (_.toSeq) getOrElse Nil
      val totalResultSetSize = page.getTotalResultSetSize
      val resultsSoFar = soFar ++ pageResults

      if (resultsSoFar.size < totalResultSetSize) {
        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
        fetch(resultsSoFar)
      } else {
        resultsSoFar
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



  def fetchAdUnitTargetingObjects(session: DfpSession, statementBuilder: StatementBuilder): Seq[AdUnit] = {
    val service = inventoryService(session)
    statementBuilder.limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)

    def fetch(soFar: Seq[AdUnit]): Seq[AdUnit] = {
      val page = service.getAdUnitsByStatement(statementBuilder.toStatement)
      val pageResults = Option(page.getResults) map (_.toSeq) getOrElse Nil
      val totalResultSetSize = page.getTotalResultSetSize
      val resultsSoFar = soFar ++ pageResults

      if (resultsSoFar.size < totalResultSetSize) {
        statementBuilder.increaseOffsetBy(StatementBuilder.SUGGESTED_PAGE_LIMIT)
        fetch(resultsSoFar)
      } else {
        resultsSoFar
      }
    }

    try {
      fetch(Nil)
    } catch {
      case e: Exception =>
        log.error(s"Exception fetching custom ad units: $e")
        Nil
    }
  }
}
