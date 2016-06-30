package common

import play.api.{Application, GlobalSettings}

import scala.concurrent.duration.FiniteDuration
import akka.agent.Agent
import akka.actor.{ActorSystem, Cancellable}
import scala.concurrent.Future
import play.libs.Akka
import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

/** Simple class for repeatedly updating a value on a schedule */
abstract class AutoRefresh[A](initialDelay: FiniteDuration, interval: FiniteDuration, actorSystem: => ActorSystem = Akka.system()) extends Logging {
  private lazy val agent = Agent[Option[A]](None)

  @volatile private var subscription: Option[Cancellable] = None

  protected def refresh(): Future[A]

  def get = agent.get()

  def getOrRefresh = (for {
    _ <- subscription
    a <- get
  } yield Future.successful(a)).getOrElse(refresh())

  final def start() = {
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

  final def stop() = subscription foreach { _.cancel() }
}
