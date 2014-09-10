package services

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model.SendMessageResult
import common.FaciaToolMetrics.{EnqueuePressFailure, EnqueuePressSuccess}
import common.{ExecutionContexts, JsonMessageQueue, Logging}
import common.SQSQueues._
import conf.Configuration
import scala.concurrent.Future
import scala.util.{Success, Failure}

case class PressCommand(ids: Set[String], live: Boolean = false, draft: Boolean = false) {
  def withPressLive(b: Boolean = true): PressCommand = this.copy(live = b)
  def withPressDraft(b: Boolean = true): PressCommand = this.copy(draft = b)
}

object PressCommand {
  def forOneId(id: String): PressCommand = PressCommand(Set(id))
}

object FaciaPressQueue extends ExecutionContexts {
  val maybeQueue = Configuration.faciatool.frontPressToolQueue map { queueUrl =>
    val credentials = Configuration.aws.mandatoryCredentials
    JsonMessageQueue[PressJob](
      new AmazonSQSAsyncClient(credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }

  def enqueue(job: PressJob): Future[SendMessageResult] = {
    maybeQueue match {
      case Some(queue) =>
        queue.send(job)

      case None =>
        Future.failed(new RuntimeException("`facia.press.queue_url` property not in config, could not enqueue job."))
    }
  }
}

object FaciaPress extends Logging with ExecutionContexts {
  def press(pressCommand: PressCommand): Future[List[SendMessageResult]] = {
    ConfigAgent.refreshAndReturn() flatMap { _ =>
      val paths: Set[String] = for {
        id <- pressCommand.ids
        path <- ConfigAgent.getConfigsUsingCollectionId(id)
      } yield path

      lazy val livePress =
        if (pressCommand.live) {
          val fut = Future.traverse(paths)(path => FaciaPressQueue.enqueue(PressJob(FrontPath(path), Live)))
          fut.onComplete {
            case Failure(error) =>
              EnqueuePressFailure.increment()
              log.error("Error manually pressing live collection through update from tool", error)
            case Success(_) =>
              EnqueuePressSuccess.increment()
          }
          fut
        } else {
          Future.successful(Set.empty)
        }

      lazy val draftPress =
        if (pressCommand.draft) {
          val fut = Future.traverse(paths)(path => FaciaPressQueue.enqueue(PressJob(FrontPath(path), Draft)))
          fut.onComplete {
            case Failure(error) =>
              EnqueuePressFailure.increment()
              log.error("Error manually pressing live collection through update from tool", error)
            case Success(_) =>
              EnqueuePressSuccess.increment()
          }
          fut
        } else Future.successful(Set.empty)

      for {
        live <- livePress
        draft <-  draftPress
      } yield (live ++ draft).toList
    }
  }
}
