package services

import com.amazonaws.regions.{Regions, Region}
import com.amazonaws.services.sqs.AmazonSQSAsyncClient
import com.amazonaws.services.sqs.model.SendMessageResult
import common.FaciaToolMetrics.{FrontPressDraftSuccess, FrontPressDraftFailure, FrontPressLiveSuccess, FrontPressLiveFailure}
import common.{ExecutionContexts, JsonMessageQueue, Logging}
import common.SQSQueues._
import conf.{FaciaToolConfiguration, Configuration}
import conf.Switches._
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
  val maybeQueue = FaciaToolConfiguration.pressQueueUrl map { queueUrl =>
    JsonMessageQueue[PressJob](
      new AmazonSQSAsyncClient(Configuration.aws.credentials).withRegion(Region.getRegion(Regions.EU_WEST_1)),
      queueUrl
    )
  }

  def enqueue(job: PressJob): Future[SendMessageResult] = {
    maybeQueue match {
      case Some(queue) =>
        queue.send(job)

      case None =>
        /** For running locally.
          *
          * TODO This ought to either error on application start up (forcing the user to set up a queue) or have some
          * fallback where it presses on the same box. Decide which, then refactor this.
          */
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
              FrontPressLiveFailure.increment()
              log.error("Error manually pressing live collection through update from tool", error)
            case Success(_) =>
              FrontPressLiveSuccess.increment()
          }
          fut
        } else {
          Future.successful(Set.empty)
        }

      lazy val draftPress =
        if (FaciaToolDraftPressSwitch.isSwitchedOn && pressCommand.draft) {
          val fut = Future.traverse(paths)(path => FaciaPressQueue.enqueue(PressJob(FrontPath(path), Draft)))
          fut.onComplete {
            case Failure(error) =>
              FrontPressDraftFailure.increment()
              log.error("Error manually pressing live collection through update from tool", error)
            case Success(_) =>
              FrontPressDraftSuccess.increment()
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
