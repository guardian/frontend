package dfp

import com.google.api.ads.dfp.axis.utils.v201508.StatementBuilder
import com.google.api.ads.dfp.axis.v201508._
import common.Logging
import common.dfp._

import scala.util.{Failure, Success, Try}

// this is being replaced by DfpApi
class DfpDataHydrator extends Logging {

  private lazy val dfpServiceRegistry = DfpServiceRegistry()

  def loadAdUnitsForApproval(rootName: String): Seq[GuAdUnit] =
    dfpServiceRegistry.fold(Seq[GuAdUnit]()) { serviceRegistry =>
      val session = new SessionWrapper(serviceRegistry.session)
      val statementBuilder = new StatementBuilder()

      val suggestedAdUnits = session.suggestedAdUnits(statementBuilder)

      val allUnits = suggestedAdUnits.map { adUnit =>
        val fullpath: List[String] = adUnit.getParentPath.map(_.getName).toList ::: adUnit.getPath.toList

        GuAdUnit(adUnit.getId, fullpath.tail)
      }

      allUnits.filter(au => (au.path.last == "ng" || au.path.last == "r2") && au.path.size == 4).sortBy(_.id).distinct
  }

  class DfpApprovalException(message: String) extends RuntimeException
  class DfpSessionException extends RuntimeException

  def approveTheseAdUnits(adUnits: Iterable[String]): Try[String] = {

    def approveTheseAdUnits(
      serviceRegistry: DfpServiceRegistry,
      statementBuilder: StatementBuilder
    ): Try[String] = {
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

    dfpServiceRegistry.map { serviceRegistry =>
      val adUnitsList: String = adUnits.mkString(",")

      val statementBuilder = new StatementBuilder()
                             .where(s"id in ($adUnitsList)")

      approveTheseAdUnits(serviceRegistry, statementBuilder)
    }.getOrElse(Failure(new DfpSessionException()))
  }
}
