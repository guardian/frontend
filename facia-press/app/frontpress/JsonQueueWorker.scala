package frontpress

import java.util.concurrent.atomic.AtomicInteger
import com.gu.contentapi.client.model.ContentApiError
import common.{GuLogging, JsonMessageQueue, Message}
import org.joda.time.DateTime
import play.api.libs.json.Reads
import software.amazon.awssdk.services.sqs.model.ReceiveMessageRequest

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

object ConsecutiveErrorsRecorder {
  def apply(): ConsecutiveErrorsRecorder = new ConsecutiveErrorsRecorder
}

final private[frontpress] class ConsecutiveErrorsRecorder {
  private val errorCount = new AtomicInteger()

  def recordSuccess(): Unit = {
    errorCount.set(0)
  }

  def recordError(): Unit = {
    errorCount.addAndGet(1)
  }

  def get: Int = errorCount.get()
}

object DateTimeRecorder {
  def apply(): DateTimeRecorder = new DateTimeRecorder
}

/** Used to record when last successfully performed some operation. If we don't expect certain operations to fail
  * repeatedly over a certain time span, we can use this to implement a health check.
  */
final private[frontpress] class DateTimeRecorder {
  @volatile private var lastTime: Option[DateTime] = None

  def refresh(): Unit = {
    lastTime = Some(DateTime.now())
  }

  def get: Option[DateTime] = lastTime
}

object JsonQueueWorker {

  /** The maximum allowed long poll time on SQS:
    * http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-long-polling.html
    */
  val WaitTimeSeconds = 20
}

/** Repeatedly long polls queue, using process method to process the job.
  *
  * Provides two
  *
  * @tparam A
  *   The job
  */
abstract class JsonQueueWorker[A: Reads]()(implicit executionContext: ExecutionContext) extends GuLogging {
  import JsonQueueWorker._

  def queue: JsonMessageQueue[A]
  val deleteOnFailure: Boolean = false

  final private val lastSuccessfulReceipt = DateTimeRecorder()
  final private val consecutiveProcessingErrors = ConsecutiveErrorsRecorder()

  final def lastReceipt: Option[DateTime] = lastSuccessfulReceipt.get
  final def consecutiveErrors: Int = consecutiveProcessingErrors.get

  def process(message: Message[A]): Future[Unit]

  def shouldRetryPress(message: Message[A]): Boolean

  final protected def getAndProcess: Future[Unit] = {
    val getRequest =
      queue.receiveOne(ReceiveMessageRequest.builder().waitTimeSeconds(WaitTimeSeconds).build()) flatMap {
        case Some(message @ Message(id, _, receipt)) =>
          lastSuccessfulReceipt.refresh()

          val ftr = process(message)

          ftr onComplete {
            case Success(_) =>
              /** Ultimately, we ought to be able to recover from processing the same message twice anyway, as the
                * nature of SQS means you could get the same message delivered twice.
                */
              queue.delete(receipt).failed.foreach { error =>
                log.error(s"Error deleting message $id from queue", error)
              }

              consecutiveProcessingErrors.recordSuccess()

            case Failure(error) =>
              if (shouldRetryPress(message)) {
                log.warn(s"JsonQueueWorker getAndProcess retrying $message", error)
                queue.retryMessageAfter(message.handle, 5)
              } else if (deleteOnFailure) {
                queue.delete(receipt).failed.foreach { e =>
                  log.error(s"Error deleting message $id from queue", e)
                }
              }
              log.error(s"Error processing message $id", error)
              consecutiveProcessingErrors.recordError()
          }

          ftr map { _ => () }

        case None =>
          lastSuccessfulReceipt.refresh()
          log.info(s"No message after $WaitTimeSeconds seconds")
          Future.successful(())
      }

    getRequest.failed.foreach {
      case error: ContentApiError =>
        log.error(
          s"Encountered content api error receiving message from queue: httpMessage: ${error.httpMessage}; status: ${error.httpStatus}; response: ${error.errorResponse
              .getOrElse("")}.",
          error,
        )
      case error: Throwable => log.error("Encountered error receiving message from queue", error)
    }

    getRequest.map(_ => ())
  }

  final private def next(): Unit = {
    getAndProcess onComplete {
      case _ if started => next()
      case _            => log.info("Stopping worker...")
    }
  }

  final private var started = false

  final def start(): Unit = {
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
