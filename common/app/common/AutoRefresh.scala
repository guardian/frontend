package common

import scala.concurrent.duration.FiniteDuration
import akka.agent.Agent
import akka.actor.Cancellable
import scala.concurrent.Future
import play.libs.Akka
import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

/** Simple class for repeatedly updating a value on a schedule */
abstract class AutoRefresh[A](initialDelay: FiniteDuration, interval: FiniteDuration) extends Logging {
  private lazy val agent = Agent[Option[A]](None)

  @volatile private var subscription: Option[Cancellable] = None

  protected def refresh(): Future[A]

  protected final def refreshAndSet(): Future[A] = {
    val ftr = refresh()

    ftr onComplete {
      case Success(a) =>
        log.debug(s"Updated AutoRefresh: $a")
        agent.send(Some(a))
      case Failure(error) =>
        log.warn("Failed to update AutoRefresh", error)
    }

    ftr
  }

  def get = agent.get()

  def getOrRefresh = (for {
    _ <- subscription
    a <- get
  } yield Future.successful(a)).getOrElse(refreshAndSet())

  final def start() = {
    log.info(s"Starting refresh cycle after $initialDelay repeatedly over $interval delay")

    subscription = Some(Akka.system.scheduler.schedule(initialDelay, interval) {
      refreshAndSet()
    })
  }

  final def stop() = subscription foreach { _.cancel() }
}
