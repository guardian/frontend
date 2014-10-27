package dfp

import com.google.api.ads.dfp.axis.factory.DfpServices
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder
import com.google.api.ads.dfp.axis.utils.v201403.StatementBuilder.SUGGESTED_PAGE_LIMIT
import com.google.api.ads.dfp.axis.v201403._
import com.google.api.ads.dfp.lib.client.DfpSession
import common.Logging
import scala.annotation.tailrec
import scala.util.{Failure, Success, Try}

object DfpApiWrapper extends Logging {

  private lazy val dfpServices = new DfpServices()

  private def lineItemService(session: DfpSession) = dfpServices.get(session, classOf[LineItemServiceInterface])
  private def customFieldService(session: DfpSession) = dfpServices.get(session, classOf[CustomFieldServiceInterface])
  private def customTargetingService(session: DfpSession) = dfpServices.get(session, classOf[CustomTargetingServiceInterface])
  private def inventoryService(session: DfpSession) = dfpServices.get(session, classOf[InventoryServiceInterface])
  private def suggestedAdUnitService(session: DfpSession) = dfpServices.get(session, classOf[SuggestedAdUnitServiceInterface])
  private def placementService(session: DfpSession) = dfpServices.get(session, classOf[PlacementServiceInterface])
  private def creativeTemplateService(session: DfpSession) = dfpServices.get(session, classOf[CreativeTemplateServiceInterface])
  private def creativeService(session: DfpSession) = dfpServices.get(session, classOf[CreativeServiceInterface])

  sealed case class Page[T](rawResults: Array[T], totalResultSetSize: Int) {
    def results: Seq[T] = Option(rawResults) map (_.toSeq) getOrElse Nil
  }

  private def fetch[T](statementBuilder: StatementBuilder)(fetchPage: Statement => Page[T]): Seq[T] = {

    @tailrec def fetch(soFar: Seq[T]): Seq[T] = {
      val page = fetchPage(statementBuilder.toStatement)
      val resultsSoFar = soFar ++ page.results
      if (resultsSoFar.size >= page.totalResultSetSize) {
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
    val service = lineItemService(session)
    fetch(statementBuilder) { statement =>
      val page = service.getLineItemsByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCustomFields(session: DfpSession, statementBuilder: StatementBuilder): Seq[CustomField] = {
    val service = customFieldService(session)
    fetch(statementBuilder) { statement =>
      val page = service.getCustomFieldsByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCustomTargetingKeys(session: DfpSession, statementBuilder: StatementBuilder): Seq[CustomTargetingKey] = {
    val service = customTargetingService(session)
    fetch(statementBuilder) { statement =>
      val page = service.getCustomTargetingKeysByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCustomTargetingValues(session: DfpSession, statementBuilder: StatementBuilder): Seq[CustomTargetingValue] = {
    val service = customTargetingService(session)
    fetch(statementBuilder) { statement =>
      val page = service.getCustomTargetingValuesByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchAdUnits(session: DfpSession, statementBuilder: StatementBuilder): Seq[AdUnit] = {
    val service = inventoryService(session)
    fetch(statementBuilder) { statement =>
      val page = service.getAdUnitsByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchSuggestedAdUnits(session: DfpSession, statementBuilder: StatementBuilder): Seq[SuggestedAdUnit] = {
    val service = suggestedAdUnitService(session)
    fetch(statementBuilder) { statement =>
      val page = service.getSuggestedAdUnitsByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchPlacements(session: DfpSession, statementBuilder: StatementBuilder): Seq[Placement] = {
    val service = placementService(session)
    fetch(statementBuilder) { statement =>
      val page = service.getPlacementsByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCreativeTemplates(session: DfpSession, statementBuilder: StatementBuilder): Seq[CreativeTemplate] = {
    val service = creativeTemplateService(session)
    fetch(statementBuilder) { statement =>
      val page = service.getCreativeTemplatesByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchTemplateCreatives(session: DfpSession, statementBuilder: StatementBuilder): Map[Long, Seq[TemplateCreative]] = {
    val service = creativeService(session)
    val creatives = fetch(statementBuilder) { statement =>
      val page = service.getCreativesByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
    creatives collect { case creative: TemplateCreative => creative} groupBy (_.getCreativeTemplateId)
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
