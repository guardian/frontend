package model.diagnostics.commercial

import play.api.libs.json.{Json, JsError, JsSuccess, JsValue}

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
  isEmpty: Option[String],
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
  modules: Seq[Module],
  adverts: Seq[Advert],
  baselines: Seq[Baseline])

object Report {

  implicit val moduleFormat = Json.format[Module]
  implicit val advertFormat = Json.format[Advert]
  implicit val baselineFormat = Json.format[Baseline]
  implicit val reportFormat = Json.format[Report]

  def report(requestBody: JsValue): Unit = {
    requestBody.validate[Report] match {
      case JsSuccess(report, _) => println("ok")
      case JsError(e) => println("not ok")
    }
  }
}