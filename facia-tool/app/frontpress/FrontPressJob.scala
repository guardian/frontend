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
import frontpress.FrontPress
import common.FaciaToolMetrics.{FrontPressSuccess, FrontPressFailure, FrontPressCronFailure, FrontPressCronSuccess}
import play.api.libs.concurrent.Akka
import scala.util.{Failure, Success}
import conf.Switches.FrontPressJobSwitch

object FrontPressJob extends Logging with implicits.Collections {
  val queueUrl: Option[String] = Configuration.faciatool.frontPressQueueUrl

  import play.api.Play.current
  private lazy implicit val frontPressContext = Akka.system.dispatchers.lookup("play.akka.actor.front-press")

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
          val receiveMessageResult = client.receiveMessage(new ReceiveMessageRequest(queueUrl).withMaxNumberOfMessages(10))
          Future.traverse(receiveMessageResult.getMessages.map(getConfigFromMessage).distinct) { path =>
            val f = pressByPathId(path)
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

  def pressByCollectionIds(ids: Set[String]): Future[Set[JsObject]] = {
    ConfigAgent.refreshAndReturn() flatMap { _ =>
      val paths: Set[String] = for {
        id <- ids
        path <- ConfigAgent.getConfigsUsingCollectionId(id)
      } yield path
      val ftr = Future.sequence(paths.map(pressByPathId))

      ftr onComplete {
        case Failure(error) =>
          FrontPressFailure.increment()
          log.error("Error manually pressing collection through update from tool", error)

        case Success(_) =>
          FrontPressSuccess.increment()
      }

      ftr
    }
  }

  def pressByPathId(path: String): Future[JsObject] = {
    FrontPress.generateJson(path).map { json =>
      (json \ "id").asOpt[String].foreach(S3FrontsApi.putLivePressedJson(_, Json.stringify(json)))
      json
    }
  }

  def getConfigFromMessage(message: Message): String =
    (Json.parse(message.getBody) \ "Message").as[String]
}
