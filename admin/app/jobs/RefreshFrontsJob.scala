package jobs

import common.Logging
import services.{S3FrontsApi, FrontPressNotification}
import play.api.libs.json.{JsString, JsObject, JsValue, Json}
import conf.switches.Switches._
import conf.Configuration

sealed trait FrontType

object LowFrequency extends FrontType
object StandardFrequency extends FrontType
object HighFrequency extends FrontType {
  def highFrequencyPaths: List[String] =
    List("uk", "us", "au", "uk/sport", "us/sport", "au/sport")
}

case class CronUpdate(path: String, frontType: FrontType)

object RefreshFrontsJob extends Logging {
  def getAllCronUpdates: Option[Seq[CronUpdate]] = {
    val masterConfigJson: Option[JsValue] = S3FrontsApi.getMasterConfig.map(Json.parse)
    for (json <- masterConfigJson)
      yield
      (for {
        path <- (json \ "fronts").asOpt[Map[String, JsValue]].getOrElse(Map.empty).keys
    } yield {
        CronUpdate(path, getFrontType(json, path))
      }).toSeq
  }

  def getFrontType(json: JsValue, path: String): FrontType = {
    lazy val isCommercial: Boolean = (json \ "fronts" \ path \ "priority") == JsString("commercial")
    lazy val isTraining: Boolean = (json \ "fronts" \ path \ "priority") == JsString("training")
    if (HighFrequency.highFrequencyPaths.contains(path))
      HighFrequency
    else if (isCommercial || isTraining)
      LowFrequency
    else
      StandardFrequency
  }

  def runFrequency(frontType: FrontType): Boolean = {
    if (Configuration.aws.frontPressSns.filter(_.nonEmpty).isDefined) {
      log.info(s"Putting press jobs on Facia Cron $frontType")

      for {
        updates <- getAllCronUpdates
        update <- updates.filter(_.frontType == frontType)
      } {
        log.info(s"Pressing $update")
        FrontPressNotification.sendWithoutSubject(update.path)
      }
      true
    } else {
      log.info("Not pressing jobs to Facia cron - is either turned off or no queue is set")
      false
    }
  }

  //This is used by a route in admin to push ALL paths to the facia-press SQS queue.
  //The facia-press boxes will start to pick these off one by one, so there is no direct overloading of these boxes
  def runAll(): Option[Seq[Unit]] = {
    Configuration.aws.frontPressSns.map(Function.const {
      log.info("Putting press jobs on Facia Cron (MANUAL REQUEST)")

      for {update <- getAllCronUpdates.getOrElse(Nil)}
        yield {
        log.info(s"Pressing $update")
        FrontPressNotification.sendWithoutSubject(update.path)}})
  }
}
