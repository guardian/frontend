package frontpress

import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import common._
import conf.Configuration
import services._

import scala.concurrent.Future

class ToolPressQueueWorker(liveFapiFrontPress: LiveFapiFrontPress, draftFapiFrontPress: DraftFapiFrontPress) extends JsonQueueWorker[PressJob] with Logging {
  override lazy val queue = (Configuration.faciatool.frontPressToolQueue map { queueUrl =>
    val credentials = Configuration.aws.mandatoryCredentials

    JsonMessageQueue[PressJob](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'frontpress.sqs.tool_queue_url' not set")
  }

  override def process(message: Message[PressJob]): Future[Unit] = {
    val PressJob(FrontPath(path), pressType, creationTime, forceConfigUpdate) = message.get

    log.info(s"Processing job from tool to update $path on $pressType")

    lazy val pressFuture: Future[Unit] = pressType match {
      case Draft => draftFapiFrontPress.pressByPathId(path)
      case Live => liveFapiFrontPress.pressByPathId(path)}

    lazy val forceConfigUpdateFuture: Future[_] =
      if (forceConfigUpdate.exists(identity)) {
        ConfigAgent.refreshAndReturn()}
      else
        Future.successful(Unit)

    for {
      _ <- forceConfigUpdateFuture
      press <- pressFuture
    } yield press

  }
}
