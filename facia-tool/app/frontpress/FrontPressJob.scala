package jobs

import common.Logging
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import conf.Configuration
import com.amazonaws.services.sqs.model._
import com.amazonaws.regions.{Regions, Region}
import scala.collection.JavaConversions._
import services.{ConfigAgent, S3FrontsApi}
import play.api.libs.json.{JsObject, Json}
import scala.concurrent.duration._
import scala.concurrent.{Future, Await}
import frontpress.FrontPress
import common.FaciaToolMetrics.{FrontPressCronFailure, FrontPressCronSuccess}
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
          receiveMessageResult.getMessages
            .map(getConfigFromMessage)
            .distinct
            .map { path =>
              val f = pressByPathId(path)
              f.onComplete {
                case Success(_) =>
                  deleteMessage(receiveMessageResult, queueUrl)
                  FrontPressCronSuccess.increment()
                case Failure(t) =>
                  deleteMessage(receiveMessageResult, queueUrl)
                  log.warn(t.toString)
                  FrontPressCronFailure.increment()
              }
              Await.ready(f, 20.seconds) //Block until ready!
          }
        } catch {
          case t: Throwable => {
            log.warn(t.toString)
            FrontPressCronFailure.increment()
          }
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
    //Give it one second to update
    Await.ready(ConfigAgent.refreshAndReturn(), Configuration.faciatool.configBeforePressTimeout.millis)
    val paths: Set[String] = for {
      id <- ids
      path <- ConfigAgent.getConfigsUsingCollectionId(id)
    } yield path
    val setOfFutureJson: Set[Future[JsObject]] = paths.map(pressByPathId)
    Future.sequence(setOfFutureJson) //To a Future of Set Json
  }

  def pressByPathId(path: String): Future[JsObject] = {
    FrontPress.generateJson(path).map { json =>
      (json \ "id").asOpt[String].foreach(S3FrontsApi.putPressedJson(_, Json.stringify(json)))
      json
    }
  }

  def getConfigFromMessage(message: Message): String =
    (Json.parse(message.getBody) \ "Message").as[String]

}
