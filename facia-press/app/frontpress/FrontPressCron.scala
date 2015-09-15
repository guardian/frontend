package frontpress

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import common.FaciaPressMetrics.{FrontPressCronFailure, FrontPressCronSuccess}
import common.{Edition, JsonMessageQueue, SNSNotification, StopWatch}
import conf.switches.Switches.FrontPressJobSwitch
import conf.Configuration
import metrics.AllFrontsPressLatencyMetric
import play.api.libs.json.JsNull

import scala.concurrent.Future
import scala.util.{Failure, Success}

object FrontPressCron extends JsonQueueWorker[SNSNotification] {
  val queueUrl: Option[String] = Configuration.faciatool.frontPressCronQueue
  override val deleteOnFailure: Boolean = true

  override val queue: JsonMessageQueue[SNSNotification] = (Configuration.faciatool.frontPressCronQueue map { queueUrl =>
    val credentials = Configuration.aws.mandatoryCredentials

    JsonMessageQueue[SNSNotification](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'frontpress.sqs.cron_queue_url' not set")
  }

  override def process(message: common.Message[SNSNotification]): Future[Unit] = {
    val path = message.get.Message

    if (FrontPressJobSwitch.isSwitchedOn) {
      log.info(s"Cron pressing path $path")
      val stopWatch = new StopWatch

      val pressFuture = LiveFapiFrontPress.pressByPathId(path)

      pressFuture onComplete {
        case Success(_) =>
          if (Edition.all.map(_.id.toLowerCase).contains(path)) {
            ToolPressQueueWorker.metricsByPath.get(path) foreach { metric =>
              metric.recordDuration(stopWatch.elapsed)
            }
          } else {
            AllFrontsPressLatencyMetric.recordDuration(stopWatch.elapsed)
          }

          log.info(s"Succesfully pressed $path in ${stopWatch.elapsed} ms")

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
