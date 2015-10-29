package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder.SUGGESTED_PAGE_LIMIT
import com.google.api.ads.dfp.axis.v201508._
import common.Logging

import scala.annotation.tailrec
import scala.util.{Failure, Success, Try}

object DfpApiWrapper extends Logging {

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
          log.error(s"API Exception fetching in the field '${err.getFieldPath}', " +
            s"caused by an invalid value '${err.getTrigger}', with the error message '${err.getErrorString}'" +
            reasonMsg)
        }
        Nil

      case e: Exception =>
        log.error(s"Exception fetching: ${e.getMessage}")
        Nil
    }
  }

  def fetchLineItems(serviceRegistry: DfpServiceRegistry,
                     statementBuilder: StatementBuilder): Seq[LineItem] = {
    val service = serviceRegistry.lineItemService
    fetch(statementBuilder) { statement =>
      val page = service.getLineItemsByStatement(statement)
      val results = Option(page.getResults).getOrElse(Array.empty)
      Page(results, page.getTotalResultSetSize)
    }
  }

  def fetchCustomFields(serviceRegistry: DfpServiceRegistry,
                        statementBuilder: StatementBuilder): Seq[CustomField] = {
    val service = serviceRegistry.customFieldService
    fetch(statementBuilder) { statement =>
      val page = service.getCustomFieldsByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCustomTargetingKeys(serviceRegistry: DfpServiceRegistry,
                               statementBuilder: StatementBuilder): Seq[CustomTargetingKey] = {
    val service = serviceRegistry.customTargetingService
    fetch(statementBuilder) { statement =>
      val page = service.getCustomTargetingKeysByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCustomTargetingValues(serviceRegistry: DfpServiceRegistry,
                                 statementBuilder: StatementBuilder): Seq[CustomTargetingValue] = {
    val service = serviceRegistry.customTargetingService
    fetch(statementBuilder) { statement =>
      val page = service.getCustomTargetingValuesByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchAdUnits(serviceRegistry: DfpServiceRegistry,
                   statementBuilder: StatementBuilder): Seq[AdUnit] = {
    val service = serviceRegistry.inventoryService
    fetch(statementBuilder) { statement =>
      val page = service.getAdUnitsByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchSuggestedAdUnits(serviceRegistry: DfpServiceRegistry,
                            statementBuilder: StatementBuilder): Seq[SuggestedAdUnit] = {
    val service = serviceRegistry.suggestedAdUnitService
    fetch(statementBuilder) { statement =>
      val page = service.getSuggestedAdUnitsByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchPlacements(serviceRegistry: DfpServiceRegistry,
                      statementBuilder: StatementBuilder): Seq[Placement] = {
    val service = serviceRegistry.placementService
    fetch(statementBuilder) { statement =>
      val page = service.getPlacementsByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchCreativeTemplates(serviceRegistry: DfpServiceRegistry,
                             statementBuilder: StatementBuilder): Seq[CreativeTemplate] = {
    val service = serviceRegistry.creativeTemplateService
    fetch(statementBuilder) { statement =>
      val page = service.getCreativeTemplatesByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
  }

  def fetchTemplateCreatives(serviceRegistry: DfpServiceRegistry,
                             statementBuilder: StatementBuilder): Map[Long, Seq[TemplateCreative]] = {
    val service = serviceRegistry.creativeService
    val creatives = fetch(statementBuilder) { statement =>
      val page = service.getCreativesByStatement(statement)
      Page(page.getResults, page.getTotalResultSetSize)
    }
    creatives collect { case creative: TemplateCreative => creative} groupBy (_
      .getCreativeTemplateId)
  }

  class DfpApprovalException(message: String) extends RuntimeException
  class DfpSessionException extends RuntimeException

  def approveTheseAdUnits(serviceRegistry: DfpServiceRegistry,
                          statementBuilder: StatementBuilder): Try[String] = {
    val approve: ApproveSuggestedAdUnit = new ApproveSuggestedAdUnit()

    val service = serviceRegistry.suggestedAdUnitService
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
