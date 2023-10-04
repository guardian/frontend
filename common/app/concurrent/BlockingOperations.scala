package concurrent

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import org.apache.pekko.dispatch.MessageDispatcher

import scala.concurrent.Future

class BlockingOperations(pekkoActorSystem: PekkoActorSystem) {
  private val blockingOperations: MessageDispatcher = pekkoActorSystem.dispatchers.lookup("pekko.blocking-operations")

  def executeBlocking[T](block: => T): Future[T] = {
    Future(block)(blockingOperations)
  }
}
