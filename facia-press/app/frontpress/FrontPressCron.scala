package frontpress

import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.gu.facia.api.models.TrainingPriority
import common.FaciaPressMetrics.FrontPressCronSuccess
import common.{JsonMessageQueue, SNSNotification}
import conf.switches.Switches.FrontPressJobSwitch
import conf.Configuration
import services.ConfigAgent

import scala.concurrent.{ExecutionContext, Future}

class FrontPressCron(liveFapiFrontPress: LiveFapiFrontPress, toolPressQueueWorker: ToolPressQueueWorker)(implicit
    executionContext: ExecutionContext,
) extends JsonQueueWorker[SNSNotification] {
  override val deleteOnFailure: Boolean = true

  def shouldRetryPress(message: common.Message[SNSNotification]): Boolean = {
    ConfigAgent.getFrontPriorityFromConfig(message.get.Message) match {
      case Some(TrainingPriority) => false
      case Some(_)                => true
      case None                   => false
    }
  }

  override val queue: JsonMessageQueue[SNSNotification] = (Configuration.faciatool.frontPressCronQueue map { queueUrl =>
    val credentials = Configuration.aws.mandatoryCredentials

    JsonMessageQueue[SNSNotification](
      AmazonSQSAsyncClient.asyncBuilder.withCredentials(credentials).withRegion(conf.Configuration.aws.region).build(),
      queueUrl,
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'frontpress.sqs.cron_queue_url' not set")
  }

  override def process(message: common.Message[SNSNotification]): Future[Unit] = {
    val path: String = message.get.Message

    if (FrontPressJobSwitch.isSwitchedOn) {
      log.info(s"Cron pressing path $path")
      val pressFuture = liveFapiFrontPress
        .pressByPathId(path, message.id.get)
        .map(Function.const(()))

      pressFuture.foreach { _ =>
        FrontPressCronSuccess.increment()
      }

      pressFuture

    } else {
      log.info(s"Ignoring message $message in Facia Press cron as cron is turned OFF")
      Future.successful(())
    }
  }
}
