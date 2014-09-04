package frontpress

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import common.FaciaPressMetrics.{FrontPressCronFailure, FrontPressCronSuccess}
import common.SQSQueues._
import common.{StopWatch, JsonMessageQueue, Edition}
import conf.Configuration
import conf.Switches.FrontPressJobSwitch
import metrics.AllFrontsPressLatencyMetric
import services.CronUpdate

import scala.concurrent.Future
import scala.util.{Failure, Success}

object FrontPressCron extends JsonQueueWorker[CronUpdate] {
  val queueUrl: Option[String] = Configuration.faciatool.frontPressCronQueue

  override val queue: JsonMessageQueue[CronUpdate] = (Configuration.faciatool.frontPressCronQueue map { queueUrl =>
    val credentials = Configuration.aws.mandatoryCredentials

    JsonMessageQueue[CronUpdate](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'frontpress.sqs.cron_queue_url' not set")
  }

  override def process(message: common.Message[CronUpdate]): Future[Unit] = {
    val path = message.get.path.get

    if (FrontPressJobSwitch.isSwitchedOn) {
      log.info(s"Cron pressing path $path")
      val stopWatch = new StopWatch
      val pressFuture = FrontPress.pressLiveByPathId(path)

      pressFuture onComplete {
        case Success(_) =>
          if (Edition.all.map(_.id.toLowerCase).contains(path)) {
            ToolPressQueueWorker.metricsByPath.get(path) foreach { metric =>
              metric.recordDuration(stopWatch.elapsed)
            }
          } else {
            AllFrontsPressLatencyMetric.recordDuration(stopWatch.elapsed)
          }

          FrontPressCronSuccess.increment()
        case Failure(error) =>
          log.warn("Error updating collection via cron", error)
          FrontPressCronFailure.increment()
      }

      pressFuture.map(Function.const(()))
    } else {
      log.info(s"Ignoring message $message in Facia Press cron as cron is turned OFF")
      Future.successful(())
    }
  }
}
