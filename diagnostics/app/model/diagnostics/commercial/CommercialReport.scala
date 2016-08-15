package model.diagnostics.commercial

import org.joda.time.DateTime
import play.api.libs.json._

case class Module(
  duration: Double,
  name: String,
  start: Double )

case class Advert(
  createTime: Option[Double],
  dfpFetching: Option[Double],
  dfpReceived: Option[Double],
  dfpRendered: Option[Double],
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
  time: Option[Double]
)

case class Report(
  viewId: String,
  modules: Seq[Module],
  adverts: Seq[Advert],
  baselines: Seq[Baseline])

object Report extends common.Logging {

  implicit val moduleFormat = Json.format[Module]
  implicit val advertFormat = Json.format[Advert]
  implicit val baselineFormat = Json.format[Baseline]
  implicit val reportFormat = Json.format[Report]

  def report(requestBody: JsValue): Unit = {
    requestBody.validate[Report] match {
      case JsSuccess(report, _) => RedisReport.report(report)
      case error: JsError => log.logger.error(JsError.toJson(error).toString)
    }
  }

  def getReports(dateTime: DateTime): JsValue = {
    val reports: List[JsValue] = RedisReport.getReports(dateTime).map { rawReport =>
      Json.parse(rawReport)
    }
    JsArray(reports)
  }
}
