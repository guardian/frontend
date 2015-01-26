package controllers

import common.{ExecutionContexts, JsonComponent}
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

object CssReportResponse {
  implicit val jsonWrites = Json.writes[CssReportResponse]
}

case class CssReportResponse(
  selectors: Seq[SelectorReport]
)

object CssReportController extends Controller with ExecutionContexts {
  def index = Action.async { implicit request =>
    CssReport.index() map { dates =>
      JsonComponent.forJsValue(Json.toJson(CssReportsIndex(dates)))
    }
  }

  def report(day: LocalDate) = Action.async { implicit request =>
    CssReport.report(day) map { selectors =>
      JsonComponent.forJsValue(Json.toJson(CssReportResponse(selectors.sortBy(_.selector))))
    }
  }
}
