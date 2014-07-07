package frontpress

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import common.{Logging, JsonMessageQueue}
import common.SQSQueues._
import conf.Configuration
import services.{Live, Draft, FrontPath, PressJob}

import scala.concurrent.Future

object ToolPressQueue extends JsonQueueWorker[PressJob] {
  override val queue = (Configuration.faciatool.frontPressToolQueue map { queueUrl =>
    JsonMessageQueue[PressJob](
      new AmazonSQSAsyncClient(Configuration.aws.credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }) getOrElse {
    throw new RuntimeException("Required property 'frontpress.sqs.tool_queue_url' not set")
  }

  override def process(job: PressJob): Future[Unit] = {
    val PressJob(FrontPath(path), pressType) = job

    (pressType match {
      case Draft => FrontPress.pressDraftByPathId(path)
      case Live => FrontPress.pressLiveByPathId(path)
    }).map(_ => ())
  }
}
