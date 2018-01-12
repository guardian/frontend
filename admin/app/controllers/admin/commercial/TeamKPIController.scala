package controllers.admin.commercial

import common.Logging
import dfp.DfpApi
import jobs.CommercialDfpReporting
import jobs.CommercialDfpReporting.DfpReportRow
import model.{ApplicationContext, NoCache}
import play.api.i18n.I18nSupport
import play.api.mvc._

case class KeyValueRevenueRow(
  customCriteria: String,
  customTargetingId: String,
  adServerAverageECPM: Int,
  adServerImpressions: Int
)

class TeamKPIController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with I18nSupport with Logging {

  def renderDashboard(): Action[AnyContent] = Action { implicit request =>
    val maybeData = for {
      reportId <- CommercialDfpReporting.reportMappings.get(CommercialDfpReporting.teamKPIReport)
      report: Seq[DfpReportRow] <- CommercialDfpReporting.getReport(reportId)
    } yield {
      val keyValueRows: Seq[KeyValueRevenueRow] = report.flatMap { row =>
        val fields = row.value.split(",").toSeq
        for {
          customCriteria: String <- fields.lift(0)
          customTargetingId: String <- fields.lift(1)
          adServerAverageECPM: Int <- fields.lift(2).map(_.toInt)
          adServerImpressions: Int <- fields.lift(3).map(_.toInt)
        } yield KeyValueRevenueRow(
          customCriteria,
          customTargetingId,
          adServerAverageECPM,
          adServerImpressions)
      }

      keyValueRows
    }

    val abTestRows = maybeData.getOrElse(Seq.empty).filter(_.customCriteria.startsWith("ab=")).sortBy(_.customCriteria)

    NoCache(Ok(views.html.commercial.revenueDashboard(abTestRows)))
  }

}