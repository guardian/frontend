package jobs

import common.Logging
import services.{S3FrontsApi, FrontPressNotification}
import play.api.libs.json.{JsObject, JsValue, Json}
import conf.Switches._
import conf.Configuration

sealed trait FrontType

case class CommercialFrequency(path: String) extends FrontType
case class StandardFrequency(path: String) extends FrontType
case class HighFrequency(path: String) extends FrontType

object HighFrequency {
  def highFrequencyPaths: List[String] = List("uk", "us", "au")
}

object RefreshFrontsJob extends Logging {
  def getCronUpdates: Option[Seq[FrontType]] = {
    val masterConfigJson: Option[JsValue] = S3FrontsApi.getMasterConfig.map(Json.parse)
    for (json <- masterConfigJson)
      yield
      (for {
        path <- (json \ "fronts").asOpt[Map[String, JsValue]].getOrElse(Map.empty).keys
    } yield {
        getFrontType(json, path)
      }).toSeq
  }

  def getFrontType(json: JsValue, path: String): FrontType = {
    lazy val isCommercial: Boolean =
      json.asOpt[Map[String, JsValue]].flatMap(_.get(path)).flatMap(_.asOpt[JsObject]).exists(_.keys.contains("commercial"))
    if (HighFrequency.highFrequencyPaths.contains(path))
      HighFrequency(path)
    else if (isCommercial)
      CommercialFrequency(path)
    else
      StandardFrequency(path)
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
