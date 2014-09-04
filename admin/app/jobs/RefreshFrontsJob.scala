package jobs

import services.{FrontPath, CronUpdate, S3FrontsApi, FrontPressNotification}
import play.api.libs.json.{JsValue, Json}
import conf.Switches._
import conf.Configuration

object RefreshFrontsJob {
  def getCronUpdates: Option[Seq[CronUpdate]] = {
    S3FrontsApi.getMasterConfig
      .map(Json.parse)
      .flatMap { json => (json \ "fronts").asOpt[Map[String, JsValue]] }
      .map(_.keys.toSeq.map(path => CronUpdate(FrontPath(path))))
  }

  def run(): Unit = {
    if (FrontPressJobSwitch.isSwitchedOn && Configuration.aws.frontPressSns.filter(_.nonEmpty).isDefined) {
      for {
        updates <- getCronUpdates
        update <- updates
      } FrontPressNotification.sendWithoutSubject(Json.stringify(Json.toJson(update)))
    }
  }
}
