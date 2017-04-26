package model.diagnostics.commercial

import common.commercial.ClientSideLogging
import org.joda.time.DateTime
import play.api.libs.json._

case class Module(
  duration: Double,
  name: String,
  start: Double )

case class Advert(
  createTime: Option[Double],
  id: Option[String],
  isEmpty: Option[Boolean],
  lazyWaitComplete: Option[Double],
  loadingMethod: Option[String],
  startLoading: Option[Double],
  startRendering: Option[Double],
  stopLoading: Option[Double],
  stopRendering: Option[Double]
)

case class Baseline(
  name: Option[String],
  startTime: Option[Double],
  endTime: Option[Double]
)

case class UserReport(
  viewId: String,
  tags: Seq[String],
  modules: Seq[Module],
  adverts: Seq[Advert],
  baselines: Seq[Baseline])

object UserReport extends common.Logging {

  implicit val moduleFormat = Json.format[Module]
  implicit val advertFormat = Json.format[Advert]
  implicit val baselineFormat = Json.format[Baseline]
  implicit val userReportFormat = Json.format[UserReport]

  def report(requestBody: JsValue): Unit = {
    requestBody.validate[UserReport] match {
      case JsSuccess(report, _) => RedisReport.report(report)
      case error: JsError => {
        log.logger.error(JsError.toJson(error).toString)
        log.logger.error(s"User Report body: ${requestBody.toString}")
      }
    }
  }

  def getReports(dateTime: DateTime): JsValue = {
    val reports: List[JsValue] = ClientSideLogging.getReports(dateTime).map { rawReport =>
      Json.parse(rawReport)
    }
    JsArray(reports)
  }
}
