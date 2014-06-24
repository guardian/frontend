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

  private def customFieldService(session: DfpSession): CustomFieldServiceInterface =
    dfpServices.get(session, classOf[CustomFieldServiceInterface])

  private def customTargetingService(session: DfpSession): CustomTargetingServiceInterface =
    dfpServices.get(session, classOf[CustomTargetingServiceInterface])

  private def inventoryService(session: DfpSession): InventoryServiceInterface =
    dfpServices.get(session, classOf[InventoryServiceInterface])

  case class Page[T](rawResults: Array[T], totalResultSetSize: Int) {
    def results: Seq[T] = Option(rawResults) map (_.toSeq) getOrElse Nil
  }

  private def fetch[T](statementBuilder: StatementBuilder)(getPage: Statement => Page[T]): Seq[T] = {

    statementBuilder.limit(StatementBuilder.SUGGESTED_PAGE_LIMIT)

    def fetch(soFar: Seq[T]): Seq[T] = {
      val page = getPage(statementBuilder.toStatement)
      val resultsSoFar = soFar ++ page.results

      if (resultsSoFar.size < page.totalResultSetSize) {
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
        log.error(s"Exception fetching: $e")
        Nil
    }
  }

  def fetchLineItems(session: DfpSession, statementBuilder: StatementBuilder): Seq[DfpApiLineItem] = {
    fetch(statementBuilder) { statement =>
      val service = lineItemService(session)
      val page = service.getLineItemsByStatement(statementBuilder.toStatement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCustomFields(session: DfpSession, statementBuilder: StatementBuilder): Seq[CustomField] = {
    fetch(statementBuilder) { statement =>
      val service = customFieldService(session)
      val page = service.getCustomFieldsByStatement(statementBuilder.toStatement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCustomTargetingKeys(session: DfpSession, statementBuilder: StatementBuilder): Seq[CustomTargetingKey] = {
    fetch(statementBuilder) { statement =>
      val service = customTargetingService(session)
      val page = service.getCustomTargetingKeysByStatement(statementBuilder.toStatement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCustomTargetingValues(session: DfpSession, statementBuilder: StatementBuilder): Seq[CustomTargetingValue] = {
    fetch(statementBuilder) { statement =>
      val service = customTargetingService(session)
      val page = service.getCustomTargetingValuesByStatement(statementBuilder.toStatement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchAdUnitTargetingObjects(session: DfpSession, statementBuilder: StatementBuilder): Seq[AdUnit] = {
    fetch(statementBuilder) { statement =>
      val service = inventoryService(session)
      val page = service.getAdUnitsByStatement(statementBuilder.toStatement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }
}
