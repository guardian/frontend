package jobs

import common.Logging
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import conf.Configuration
import com.amazonaws.services.sqs.model._
import com.amazonaws.regions.{Regions, Region}
import scala.collection.JavaConversions._
import services.{ConfigAgent, S3FrontsApi}
import play.api.libs.json.{JsObject, Json}
import scala.concurrent.Future
import frontpress.{PressResult, PressCommand, FrontPress}
import common.FaciaToolMetrics.{FrontPressSuccess, FrontPressFailure, FrontPressCronFailure, FrontPressCronSuccess}
import play.api.libs.concurrent.Akka
import scala.util.{Failure, Success}
import conf.Switches.FrontPressJobSwitch

object FrontPressJob extends Logging with implicits.Collections {
  val queueUrl: Option[String] = Configuration.faciatool.frontPressQueueUrl

  import play.api.Play.current
  private lazy implicit val frontPressContext = Akka.system.dispatchers.lookup("play.akka.actor.front-press")

  val batchSize: Int = Configuration.faciatool.pressJobBatchSize

  def newClient: AmazonSQSAsyncClient = {
    val c = new AmazonSQSAsyncClient(Configuration.aws.credentials)
    c.setRegion(Region.getRegion(Regions.EU_WEST_1))
    c
  }

  def run(): Unit = {
    for(queueUrl <- queueUrl) {
      if (FrontPressJobSwitch.isSwitchedOn) {
        val client = newClient
        try {
          val receiveMessageResult = client.receiveMessage(new ReceiveMessageRequest(queueUrl).withMaxNumberOfMessages(batchSize))
          Future.traverse(receiveMessageResult.getMessages.map(getConfigFromMessage).distinct) { path =>
            val f = FrontPress.pressByPathId(path)
            f onComplete {
              case Success(_) =>
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
