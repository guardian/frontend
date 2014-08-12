package dfp

import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import scala.util.{Failure, Success, Try}

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

  private def suggestedAdUnitService(session: DfpSession): SuggestedAdUnitServiceInterface =
    dfpServices.get(session, classOf[SuggestedAdUnitServiceInterface])

  private def placementService(session: DfpSession): PlacementServiceInterface =
    dfpServices.get(session, classOf[PlacementServiceInterface])

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

      case e: ApiException =>
        e.getErrors foreach { err =>
          val reasonMsg = err match {
            case freqCapErr: FrequencyCapError => s", with the reason '${freqCapErr.getReason}'"
            case notNullErr: NotNullError => s", with the reason '${notNullErr.getReason}'"
            case _ => ""
          }
          log.error(s"API Exception fetching: type '${err.getApiErrorType}', on the field '${err.getFieldPath}', " +
            s"caused by an invalid value '${err.getTrigger}', with the error message '${err.getErrorString}'" +
            reasonMsg)
        }
        Nil

      case e: Exception =>
        log.error(s"Exception fetching: ${e.getMessage}")
        Nil
    }
  }

  def fetchLineItems(session: DfpSession, statementBuilder: StatementBuilder): Seq[LineItem] = {
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

  def fetchAdUnits(session: DfpSession, statementBuilder: StatementBuilder): Seq[AdUnit] = {
    fetch(statementBuilder) { statement =>
      val service = inventoryService(session)
      val page = service.getAdUnitsByStatement(statementBuilder.toStatement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchSuggestedAdUnits(session: DfpSession, statementBuilder: StatementBuilder): Seq[SuggestedAdUnit] = {
    fetch(statementBuilder) { statement =>
      val service = suggestedAdUnitService(session)
      val page = service.getSuggestedAdUnitsByStatement(statementBuilder.toStatement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchPlacements(session: DfpSession, statementBuilder: StatementBuilder): Seq[Placement] = {
    fetch(statementBuilder) { statement =>
      val service = placementService(session)
      val page = service.getPlacementsByStatement(statementBuilder.toStatement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  class DfpApprovalException(message: String) extends RuntimeException
  class DfpSessionException extends RuntimeException

  def approveTheseAdUnits(session: DfpSession, statementBuilder: StatementBuilder): Try[String] = {
    val approve: ApproveSuggestedAdUnit = new ApproveSuggestedAdUnit()

    val service = suggestedAdUnitService(session)
    try {
      val result = Option(service.performSuggestedAdUnitAction(approve, statementBuilder.toStatement))
      if (result.isDefined) {
        if (result.get.getNumChanges > 0) {
          Success("Ad units approved")
        } else {
          Failure(new DfpApprovalException("Apparently, nothing changed"))
        }
      } else {
        Failure(new DfpApprovalException("Everything failed"))
      }
    } catch {
      case e: Exception => Failure(e)
    }
  }

}
