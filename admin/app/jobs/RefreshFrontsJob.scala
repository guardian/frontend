package jobs

import services.{S3FrontsApi, FrontPressNotification}
import play.api.libs.json.{JsValue, Json}
import conf.Switches._
import conf.Configuration

object RefreshFrontsJob {

  def getPaths: Option[Seq[String]] = {
    S3FrontsApi.getMasterConfig
      .map(Json.parse)
      .flatMap { json => (json \ "fronts").asOpt[Map[String, JsValue]] }
      .map(_.keys.toSeq)
  }

  def run(): Unit = {
    if (FrontPressJobSwitch.isSwitchedOn && Configuration.aws.frontPressSns.filter(_.nonEmpty).isDefined) {
      getPaths map(_.map(FrontPressNotification.sendWithoutSubject))
    }
  }
}
