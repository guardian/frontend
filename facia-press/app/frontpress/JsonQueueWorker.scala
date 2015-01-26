package frontpress

import java.util.concurrent.atomic.AtomicInteger

import com.amazonaws.services.sqs.model.ReceiveMessageRequest
import common.{ExecutionContexts, Message, Logging, JsonMessageQueue}
import org.joda.time.DateTime
import play.api.libs.json.Reads

import scala.concurrent.Future
import scala.util.{Failure, Success}

object ConsecutiveErrorsRecorder {
  def apply() = new ConsecutiveErrorsRecorder
}

final private[frontpress] class ConsecutiveErrorsRecorder {
  private val errorCount = new AtomicInteger()

  def recordSuccess() = {
    errorCount.set(0)
  }

  def recordError() {
    errorCount.addAndGet(1)
  }

  def get = errorCount.get()
}

object DateTimeRecorder {
  def apply() = new DateTimeRecorder
}

/** Used to record when last successfully performed some operation. If we don't expect certain operations to fail
  * repeatedly over a certain time span, we can use this to implement a health check.
  */
final private[frontpress] class DateTimeRecorder {
  @volatile private var lastTime: Option[DateTime] = None

  def refresh() {
    lastTime = Some(DateTime.now())
  }

  def get = lastTime
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
  * @tparam A The job
  */
abstract class JsonQueueWorker[A: Reads] extends Logging with ExecutionContexts {
  import JsonQueueWorker._

  val queue: JsonMessageQueue[A]
  val deleteOnFailure: Boolean = false

  final private val lastSuccessfulReceipt = DateTimeRecorder()
  final private val consecutiveProcessingErrors = ConsecutiveErrorsRecorder()

  final def lastReceipt = lastSuccessfulReceipt.get
  final def consecutiveErrors = consecutiveProcessingErrors.get

  def process(message: Message[A]): Future[Unit]

  final protected def getAndProcess: Future[Unit] = {
    val getRequest = queue.receiveOne(new ReceiveMessageRequest().withWaitTimeSeconds(WaitTimeSeconds))

    getRequest onComplete {
      case Success(Some(message @ Message(id, _, receipt))) =>
        lastSuccessfulReceipt.refresh()

        process(message) onComplete {
          case Success(_) =>
            /** Ultimately, we ought to be able to recover from processing the same message twice anyway, as the nature
              * of SQS means you could get the same message delivered twice.
              */
            queue.delete(receipt) onFailure {
              case error => log.error(s"Error deleting message $id from queue", error)
            }

            consecutiveProcessingErrors.recordSuccess()

          case Failure(error) =>
            if (deleteOnFailure) {
              queue.delete(receipt) onFailure {
                case e => log.error(s"Error deleting message $id from queue", e)}}
            log.error(s"Error processing message $id", error)
            consecutiveProcessingErrors.recordError()
        }

      case Success(None) =>
        lastSuccessfulReceipt.refresh()
        log.info(s"No message after $WaitTimeSeconds seconds")

      case Failure(error) =>
        log.error("Encountered error receiving message from queue", error)
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
