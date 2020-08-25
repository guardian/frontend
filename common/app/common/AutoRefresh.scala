package common

import scala.concurrent.duration.FiniteDuration
import akka.actor.{ActorSystem, Cancellable}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}
import com.gu.Box

/** Simple class for repeatedly updating a value on a schedule */
abstract class AutoRefresh[A](initialDelay: FiniteDuration, interval: FiniteDuration) extends Logging {

  private lazy val agent = Box[Option[A]](None)

  @volatile private var subscription: Option[Cancellable] = None

  protected def refresh()(implicit executionContext: ExecutionContext): Future[A]

  def get: Option[A] = agent.get()

  def getOrRefresh()(implicit executionContext: ExecutionContext): Future[A] =
    (for {
      _ <- subscription
      a <- get
    } yield Future.successful(a)).getOrElse(refresh())

  final def start()(implicit actorSystem: ActorSystem, executionContext: ExecutionContext): Unit = {
    log.info(s"Starting refresh cycle after $initialDelay repeatedly over $interval delay")

    subscription = Some(actorSystem.scheduler.schedule(initialDelay, interval) {
      refresh() onComplete {
        case Success(a) =>
          log.debug(s"Updated AutoRefresh: $a")
          agent.send(Some(a))
        case Failure(error) =>
          log.warn("Failed to update AutoRefresh", error)
      }
    })
  }

  final def stop(): Unit = subscription foreach { _.cancel() }
}
