package controllers.admin

import common.{ExecutionContexts, JsonComponent}
import conf.Configuration
import org.joda.time.LocalDate
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}
import css_report.{SelectorReport, CssReport}

object CssReportsIndex {
  implicit val jsonWrites = Json.writes[CssReportsIndex]
}

case class CssReportsIndex(
  days: Seq[LocalDate]
)

object UsedAndUnused {
  implicit val jsonFormat = Json.format[UsedAndUnused]
}

case class UsedAndUnused(
  used: Int,
  unused: Int
)

object CssReportResponse {
  implicit val jsonWrites = Json.writes[CssReportResponse]

  def fromSelectors(selectors: Seq[SelectorReport]) = CssReportResponse(
    selectors.map(selector => selector.selector -> UsedAndUnused(selector.used, selector.unused)).toMap
  )
}

case class CssReportResponse(
  selectors: Map[String, UsedAndUnused]
)

class CssReportController extends Controller with ExecutionContexts {
  def entry = Action { implicit request =>
    Ok(views.html.cssReport(Configuration.environment.stage))
  }

  def index = Action.async { implicit request =>
    CssReport.index() map { dates =>
      JsonComponent.forJsValue(Json.toJson(CssReportsIndex(dates))).result
    }
  }

  def report(day: LocalDate) = Action.async { implicit request =>
    CssReport.report(day) map { selectors =>
      JsonComponent.forJsValue(Json.toJson(CssReportResponse.fromSelectors(selectors))).result
    }
  }

  def aggregateReport = Action.async { implicit request =>
    CssReport.aggregateReport map { selectors =>
      JsonComponent.forJsValue(Json.toJson(CssReportResponse.fromSelectors(selectors))).result
    }
  }
}
