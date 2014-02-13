package jobs

import services.{S3FrontsApi, FrontPressNotification}
import play.api.libs.json.{JsValue, Json}
import conf.Switches._

object RefreshFrontsJob {

  def getPaths: Option[Seq[String]] = {
    S3FrontsApi.getMasterConfig
      .map(Json.parse)
      .flatMap { json => (json \ "fronts").asOpt[Map[String, JsValue]] }
      .map(_.keys.toSeq)
  }

  def run(): Unit = {
    if (FrontPressJobSwitch.isSwitchedOn) {
      getPaths map(_.map(FrontPressNotification.sendWithoutSubject))
    }
  }
}
