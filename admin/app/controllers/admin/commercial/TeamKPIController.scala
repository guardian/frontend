package controllers.admin.commercial

import common.Logging
import dfp.DfpApi
import model.{ApplicationContext, NoCache}
import play.api.i18n.I18nSupport
import play.api.mvc._

case class KeyValueRevenueRow(
    customCriteria: String,
    customTargetingId: String,
    adServerAverageECPM: Int,
    adServerImpressions: Int
  )

class TeamKPIController(val controllerComponents: ControllerComponents, dfpApi: DfpApi)(implicit context: ApplicationContext)
    extends BaseController with I18nSupport with Logging {

  def renderDashboard(): Action[AnyContent] = Action { implicit request =>
    val report: Seq[String] =  dfpApi.getReportQuery(10060521970L)
      .map(dfpApi.runReportJob)
      .getOrElse(Seq.empty)
      .tail // exclude the CSV header

    val keyValueRows: Seq[KeyValueRevenueRow] = report.flatMap { row =>
      val fields = row.split(",").toSeq
      for {
        customCriteria <- fields.lift(0)
        customTargetingId <- fields.lift(1)
        adServerAverageECPM <- fields.lift(2).map(_.toInt)
        adServerImpressions <- fields.lift(3).map(_.toInt)
      } yield KeyValueRevenueRow(
        customCriteria,
        customTargetingId,
        adServerAverageECPM,
        adServerImpressions)
    }

    val abTestRows = keyValueRows.filter(_.customCriteria.startsWith("ab=")).sortBy(_.customCriteria)

    NoCache(Ok(views.html.commercial.revenueDashboard(abTestRows)))
  }

}