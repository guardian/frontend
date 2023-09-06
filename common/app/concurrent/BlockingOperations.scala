package concurrent

import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.dispatch.MessageDispatcher

import scala.concurrent.Future

class BlockingOperations(actorSystem: ActorSystem) {
  private val blockingOperations: MessageDispatcher = actorSystem.dispatchers.lookup("akka.blocking-operations")

  def executeBlocking[T](block: => T): Future[T] = {
    Future(block)(blockingOperations)
  }
}
