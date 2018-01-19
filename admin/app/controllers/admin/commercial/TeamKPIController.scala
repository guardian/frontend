package controllers.admin.commercial

import common.Logging
import jobs.CommercialDfpReporting
import jobs.CommercialDfpReporting.DfpReportRow
import model.{ApplicationContext, NoCache}
import play.api.i18n.I18nSupport
import play.api.mvc._

case class KeyValueRevenueRow(
  customCriteria: String,
  customTargetingId: String,
  totalImpressions: Int,
  totalAverageECPM: Double
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
          totalImpressions: Int <- fields.lift(2).map(_.toInt)
          totalAverageECPM: Double <- fields.lift(3).map(_.toDouble / 1000000.0d) // convert DFP micropounds to pounds
        } yield KeyValueRevenueRow(
          customCriteria,
          customTargetingId,
          totalImpressions,
          totalAverageECPM)
      }

      keyValueRows
    }

    // The test variants for the team KPIs are commercialBaselineControl-control and commercialBaselineVariant-variant.
    val abTestRows = maybeData.getOrElse(Seq.empty)

    val controlDataRow = abTestRows.find(_.customCriteria.startsWith("ab=commercialBaselineControl"))
    val variantDataRow = abTestRows.find(_.customCriteria.startsWith("ab=commercialBaselineVariant"))

    val integerFormatter = java.text.NumberFormat.getIntegerInstance
    val currencyFormatter = java.text.NumberFormat.getCurrencyInstance

    NoCache(Ok(views.html.commercial.revenueDashboard(controlDataRow, variantDataRow, integerFormatter, currencyFormatter)))
  }

}