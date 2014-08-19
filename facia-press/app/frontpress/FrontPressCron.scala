package frontpress

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model._
import common.FaciaPressMetrics.{FrontPressCronFailure, FrontPressCronSuccess}
import common.SQSQueues._
import common.{Edition, Logging}
import conf.Configuration
import conf.Switches.FrontPressJobSwitch
import metrics.AllFrontsPressLatencyMetric
import org.joda.time.DateTime
import play.api.libs.concurrent.Akka
import play.api.libs.json.Json

import scala.collection.JavaConversions._
import scala.concurrent.Future
import scala.util.{Failure, Success}

/** TODO convert this to use JsonQueueWorker
  *
  * (So as to a) reduce code, and b) allow us to use the various metrics it gives for health checks)
  */
object FrontPressCron extends Logging with implicits.Collections {
  val queueUrl: Option[String] = Configuration.faciatool.frontPressCronQueue

  import play.api.Play.current
  private lazy implicit val frontPressContext = Akka.system.dispatchers.lookup("play.akka.actor.front-press")

  val batchSize: Int = Configuration.faciatool.pressJobBatchSize

  def newClient: AmazonSQSAsyncClient = {
    new AmazonSQSAsyncClient(Configuration.aws.mandatoryCredentials).withRegion(Region.getRegion(Regions.EU_WEST_1))
  }

  def run(): Unit = {
    for (queueUrl <- queueUrl) {
      if (FrontPressJobSwitch.isSwitchedOn) {
        val client = newClient
        try {
          val receiveMessageResult = client.receiveMessage(new ReceiveMessageRequest(queueUrl).withMaxNumberOfMessages(batchSize))
          Future.traverse(receiveMessageResult.getMessages.map(getConfigFromMessage).distinct) { path =>
            val start = DateTime.now
            val f = FrontPress.pressLiveByPathId(path)
            f onComplete {
              case Success(_) =>

                if (Edition.all.map(_.id.toLowerCase).exists(_ == path))
                  ToolPressQueueWorker.metricsByPath.get(path).foreach { metric =>
                    metric.recordDuration(DateTime.now.getMillis - start.getMillis)
                  }
                else
                  AllFrontsPressLatencyMetric.recordDuration(DateTime.now.getMillis - start.getMillis)

                deleteMessage(receiveMessageResult, queueUrl)
                FrontPressCronSuccess.increment()
              case Failure(error) =>
                deleteMessage(receiveMessageResult, queueUrl)
                log.warn("Error updating collection via cron", error)
                FrontPressCronFailure.increment()
            }
            f
          }
        } catch {
          case error: Throwable =>
            log.error("Error updating collection via cron", error)
            FrontPressCronFailure.increment()
        }
      }
    }
  }

  def deleteMessage(receiveMessageResult: ReceiveMessageResult, queueUrl: String): DeleteMessageBatchResult = {
    val client = newClient
    client.deleteMessageBatch(
      new DeleteMessageBatchRequest(
        queueUrl,
        receiveMessageResult.getMessages.map { msg => new DeleteMessageBatchRequestEntry(msg.getMessageId, msg.getReceiptHandle)}
      )
    )
  }

  def getConfigFromMessage(message: Message): String =
    (Json.parse(message.getBody) \ "Message").as[String]
}
