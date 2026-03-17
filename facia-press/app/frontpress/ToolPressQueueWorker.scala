package frontpress

import com.gu.facia.api.models.faciapress.{Draft, FrontPath, Live, PressJob}
import common.LoggingField.{LogFieldLong, LogFieldString}
import common._
import conf.Configuration
import org.joda.time.DateTime
import services._
import software.amazon.awssdk.services.sqs.SqsAsyncClient
import utils.AWSv2

import scala.concurrent.{ExecutionContext, Future}

class ToolPressQueueWorker(liveFapiFrontPress: LiveFapiFrontPress, draftFapiFrontPress: DraftFapiFrontPress)(implicit
    executionContext: ExecutionContext,
) extends JsonQueueWorker[PressJob]
    with GuLogging {
  override lazy val queue: JsonMessageQueue[PressJob] = (Configuration.faciatool.frontPressToolQueue map { queueUrl =>
    JsonMessageQueue[PressJob](
      SqsAsyncClient
        .builder()
        .credentialsProvider(AWSv2.credentials)
        .region(AWSv2.region)
        .build(),
      queueUrl,
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'frontpress.sqs.tool_queue_url' not set")
  }

  override def shouldRetryPress(message: Message[PressJob]): Boolean = false

  // log a warning if facia press is taking too long to pick up messages
  private def checkAndLogLatency(
      frontPath: String,
      processTime: Long,
      messageId: String,
      creationTime: DateTime,
      startTime: DateTime,
  ): Unit = {
    val messageLatency = startTime.getMillis - creationTime.getMillis
    if (messageLatency > 4000 || processTime > 3500) {
      logWarningWithCustomFields(
        s"Facia press took $messageLatency ms to pick up and $processTime time to process $frontPath. Message creation time $creationTime, process start time $startTime",
        null,
        customFields = List(
          LogFieldLong("pressReceiveDelay", messageLatency),
          LogFieldLong("pressProcessDelay", processTime),
          LogFieldString("messageId", messageId),
          LogFieldString("pressPath", frontPath),
          LogFieldString("pressStartTime", startTime.toString),
        ),
      )
    }
  }

  override def process(message: Message[PressJob]): Future[Unit] = {
    val PressJob(FrontPath(path), pressType, creationTime, forceConfigUpdate) = message.get

    val messageId = message.id.get

    val processStartTime = DateTime.now()
    log.debug(s"Processing job from tool to update $path on $pressType at time $creationTime. MessageId: $messageId")

    val stopWatch = new StopWatch

    lazy val pressFuture: Future[Unit] = pressType match {
      case Draft => draftFapiFrontPress.pressByPathId(path)
      case Live  => liveFapiFrontPress.pressByPathId(path)
    }

    lazy val forceConfigUpdateFuture: Future[_] =
      if (forceConfigUpdate.exists(identity)) {
        ConfigAgent.refreshAndReturn
      } else
        Future.successful(())

    for {
      _ <- forceConfigUpdateFuture
      press <- pressFuture
    } yield {
      val processTime = stopWatch.elapsed
      checkAndLogLatency(path, processTime, messageId, creationTime, processStartTime)
      press
    }

  }
}
