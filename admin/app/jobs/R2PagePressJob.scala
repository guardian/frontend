package jobs

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model.ReceiveMessageRequest
import common._
import conf.Configuration
import play.api.libs.json.Reads

import scala.concurrent.Future
import scala.util.{Failure, Success}

object TextQueueWorker {
  /** The maximum allowed long poll time on SQS:
    * http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-long-polling.html
    */
  val WaitTimeSeconds = 20
}

abstract class TextQueueWorker[A: Reads] extends Logging with ExecutionContexts {
  import TextQueueWorker._
  val queue: TextMessageQueue[A]
  def process(message: Message[String]): Future[Unit]

  final protected def getAndProcess: Future[Unit] = {
    val getRequest = queue.receiveOne(new ReceiveMessageRequest().withWaitTimeSeconds(WaitTimeSeconds)) flatMap {
      case Some(message) =>
        val futureResult = process(message)

        futureResult onComplete {
          case Success(_) => queue.delete(message.handle) onFailure {
            case error => log.error(s"Error deleting message ${message.id} from queue", error)
          }
          case Failure(_) =>
        }

        futureResult map { _ => () }

      case None =>
        log.info(s"No message after $WaitTimeSeconds seconds")
        Future.successful(())

    }

    getRequest onFailure {
      case error: Throwable => log.error("Encountered error receiving message from queue", error)
    }

    getRequest.map(_ => ())

  }

  final private def next() {
    getAndProcess onComplete {
      case _ if started => next()
      case _ => log.info("Stopping worker...")
    }
  }

  final private var started = false

  final def start() {
    synchronized {
      if (started) {
        log.warn("Attempted to start queue worker but queue worker is already started")
      } else {
        log.info("Starting worker ... ")
        started = true
        next()
      }
    }
  }

  final def stop(): Unit = {
    synchronized {
      started = false
    }
  }

}

object R2PagePressJob extends TextQueueWorker[SNSNotification] with Logging {
  override val queue: TextMessageQueue[SNSNotification] = (Configuration.r2Press.sqsQueueUrl map { queueUrl =>
    val credentials = Configuration.aws.mandatoryCredentials

    TextMessageQueue[SNSNotification](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'r2Press.sqsQueueUrl' not set")
  }

  override def process(message: Message[String]): Future[Unit] = {
    try {
      val url = message.get
      //TODO - Make an HTTP request (or go direct to Article) for the url
      val html = "result from frontend"
      println(s"### $url -> $html")
      Future(None)
    } catch {
      case e: Exception => {
        log.error(s"Failed to decode r2 url: ${e.getMessage}")
        Future(None)
      }
    }
  }
}
