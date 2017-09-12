package jobs

import com.gu.facia.api.models.{CommercialPriority, EditorialPriority, EmailPriority, TrainingPriority}
import common.{AkkaAsync, Logging}
import conf.Configuration
import services.{ConfigAgent, FrontPressNotification}

import scala.concurrent.ExecutionContext

sealed trait FrontType

object LowFrequency extends FrontType
object StandardFrequency extends FrontType
object HighFrequency extends FrontType {
  def highFrequencyPaths: List[String] =
    List("uk", "us", "au", "uk/sport", "us/sport", "au/sport")
}

case class CronUpdate(path: String, frontType: FrontType)

object RefreshFrontsJob extends Logging {
  def getAllCronUpdates: Seq[CronUpdate] = {
    ConfigAgent.getPathIds.map(path => CronUpdate(path, getFrontType(path)))
  }

  def getFrontType(path: String): FrontType = {
    if (HighFrequency.highFrequencyPaths.contains(path))
      HighFrequency
    else
      ConfigAgent.getFrontPriorityFromConfig(path) match {
        case Some(EditorialPriority) => StandardFrequency
        case Some(CommercialPriority) => LowFrequency
        case Some(TrainingPriority) => LowFrequency
        case Some(EmailPriority) => StandardFrequency
        case None => LowFrequency
      }
  }

  def runFrequency(akkaAsync: AkkaAsync)(frontType: FrontType)(implicit executionContext: ExecutionContext): Boolean = {
    if (Configuration.aws.frontPressSns.exists(_.nonEmpty)) {
      log.info(s"Putting press jobs on Facia Cron $frontType")
      for (update <- getAllCronUpdates.filter(_.frontType == frontType)) {
        log.info(s"Pressing $update")
        FrontPressNotification.sendWithoutSubject(akkaAsync)(update.path)
      }
      true
    } else {
      log.info("Not pressing jobs to Facia cron - is either turned off or no queue is set")
      false
    }
  }

  //This is used by a route in admin to push ALL paths to the facia-press SQS queue.
  //The facia-press boxes will start to pick these off one by one, so there is no direct overloading of these boxes
  def runAll(akkaAsync: AkkaAsync)(implicit executionContext: ExecutionContext): Option[Seq[Unit]] = {
    Configuration.aws.frontPressSns.map(Function.const {
      log.info("Putting press jobs on Facia Cron (MANUAL REQUEST)")
      for (update <- getAllCronUpdates)
        yield {
        log.info(s"Pressing $update")
        FrontPressNotification.sendWithoutSubject(akkaAsync)(update.path)}})
  }
}
