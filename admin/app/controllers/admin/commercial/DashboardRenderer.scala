package controllers.admin.commercial

import java.util.Locale

import jobs.CommercialDfpReporting
import jobs.CommercialDfpReporting.DfpReportRow
import model.{ApplicationContext, NoCache}
import play.api.mvc._

object DashboardRenderer extends Results {

  def renderDashboard(testName: String, dashboardTitle: String, controlColour: String, variantColour: String)(implicit
      request: RequestHeader,
      context: ApplicationContext,
  ): Result = {
    val maybeData = for {
      reportId <- CommercialDfpReporting.reportMappings.get(CommercialDfpReporting.teamKPIReport)
      report: Seq[DfpReportRow] <- CommercialDfpReporting.getReport(reportId)
    } yield {
      val keyValueRows: Seq[KeyValueRevenueRow] = report.flatMap { row =>
        val fields = row.fields
        for {
          customCriteria: String <- fields.lift(0)
          customTargetingId: String <- fields.lift(1)
          totalImpressions: Int <- fields.lift(2).map(_.toInt)
          totalAverageECPM: Double <- fields.lift(3).map(_.toDouble / 1000000.0d) // convert DFP micropounds to pounds
        } yield KeyValueRevenueRow(customCriteria, customTargetingId, totalImpressions, totalAverageECPM)
      }

      keyValueRows
    }

    val abTestRows = maybeData.getOrElse(Seq.empty)

    val controlDataRow = abTestRows.find(_.customCriteria.startsWith(s"ab=${testName}Control"))
    val variantDataRow = abTestRows.find(_.customCriteria.startsWith(s"ab=${testName}Variant"))

    val integerFormatter = java.text.NumberFormat.getIntegerInstance
    val currencyFormatter = java.text.NumberFormat.getCurrencyInstance(Locale.UK)

    NoCache(
      Ok(
        views.html.commercial.revenueDashboard(
          controlDataRow,
          variantDataRow,
          integerFormatter,
          currencyFormatter,
          dashboardTitle,
          controlColour,
          variantColour,
        ),
      ),
    )
  }
}
