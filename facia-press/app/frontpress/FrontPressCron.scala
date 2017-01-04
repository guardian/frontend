package frontpress

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import common.FaciaPressMetrics.{FrontPressCronSuccess, AllFrontsPressLatencyMetric}
import common.{Edition, JsonMessageQueue, SNSNotification, StopWatch}
import conf.switches.Switches.FrontPressJobSwitch
import conf.Configuration

import scala.concurrent.Future
import scala.util.{Failure, Success}

class FrontPressCron(liveFapiFrontPress: LiveFapiFrontPress, toolPressQueueWorker: ToolPressQueueWorker) extends JsonQueueWorker[SNSNotification] {
  lazy val queueUrl: Option[String] = Configuration.faciatool.frontPressCronQueue
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
    val path: String = message.get.Message

    if (FrontPressJobSwitch.isSwitchedOn) {
      log.info(s"Cron pressing path $path")
      val stopWatch: StopWatch = new StopWatch

      val pressFuture: Future[Unit] = liveFapiFrontPress.pressByPathId(path)

      pressFuture.onComplete {
        case Success(_) =>
          if (Edition.all.map(_.id.toLowerCase).contains(path)) {
            toolPressQueueWorker.metricsByPath.get(path) foreach { metric =>
              metric.recordDuration(stopWatch.elapsed)
            }
          } else {
            AllFrontsPressLatencyMetric.recordDuration(stopWatch.elapsed)
          }

          log.info(s"Succesfully pressed $path in ${stopWatch.elapsed} ms")

          FrontPressCronSuccess.increment()
        case Failure(error) =>
          log.warn(s"Error pressing $path:", error)
      }

      pressFuture.map(Function.const(()))
    } else {
      log.info(s"Ignoring message $message in Facia Press cron as cron is turned OFF")
      Future.successful(())
    }
  }
}
