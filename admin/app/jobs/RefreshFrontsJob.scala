package jobs

import common.Logging
import services.{S3FrontsApi, FrontPressNotification}
import play.api.libs.json.{JsValue, Json}
import conf.Switches._
import conf.Configuration

object RefreshFrontsJob extends Logging {
  def getCronUpdates: Option[Seq[String]] = {
    S3FrontsApi.getMasterConfig
      .map(Json.parse)
      .flatMap { json => (json \ "fronts").asOpt[Map[String, JsValue]] }
      .map(_.keys.toSeq)
  }

  def run(): Unit = {
    if (FrontPressJobSwitch.isSwitchedOn && Configuration.aws.frontPressSns.filter(_.nonEmpty).isDefined) {
      log.info("Putting press jobs on Facia Cron")

      for {
        updates <- getCronUpdates
        update <- updates
      } {
        log.info(s"Pressing $update")
        FrontPressNotification.sendWithoutSubject(update)
      }
    } else {
      log.info("Not pressing jobs to Facia cron - is either turned off or no queue is set")
    }
  }
}
