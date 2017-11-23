package concurrent

import java.util.concurrent.TimeUnit
import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import akka.util.Timeout
import akka.pattern.{PipeToSupport, ask}
import scala.concurrent.{ExecutionContext, Future}
import scala.reflect.ClassTag
import scala.util.{Failure, Success, Try}

class FutureSemaphore(maxOperations: Int)(implicit ec: ExecutionContext) extends Actor with PipeToSupport {
  import FutureSemaphore._

  private var operationsInProgress: Int = 0

  override def receive: PartialFunction[Any, Unit] = {
    case task: ConcurrentTask[Any] => receiveTask(task)
    case result: ConcurrentResult[Any] => receiveResult(result)
  }

  private def receiveResult(result: ConcurrentResult[Any]): Unit = {
    result.sender ! result.result
    operationsInProgress = operationsInProgress - 1
  }

  private def receiveTask(task: ConcurrentTask[Any]) = {
    if (operationsInProgress >= maxOperations) {
      sender ! Failure(new RuntimeException(s"Too many operations in progress, cannot execute $task"))
    } else {
      operationsInProgress = operationsInProgress + 1
      taskToResult(task, sender) pipeTo self
    }
  }
}

object FutureSemaphore {
  case class ConcurrentTask[+T](task: () => Future[T])
  private case class ConcurrentResult[+T](result: Try[T], sender: ActorRef)

  private def taskToResult[T](concurrentTask: ConcurrentTask[T], sender: ActorRef)(implicit ec: ExecutionContext): Future[ConcurrentResult[T]] = {
    concurrentTask.task().map(Success.apply).recover {
      case e => Failure(e)
    }.map(ConcurrentResult(_, sender))
  }

  def actorRef(maxOperations: Int)(implicit actorSystem: ActorSystem, ex: ExecutionContext): ActorRef = {
    actorSystem.actorOf(Props(new FutureSemaphore(maxOperations)))
  }

  def executeTask[T](actor: ActorRef, t: => Future[T])
                    (implicit tag: ClassTag[Try[T]], ec: ExecutionContext, timeout: Timeout = Timeout(10, TimeUnit.SECONDS)): Future[T] = {
    val task = FutureSemaphore.ConcurrentTask(() => t)
    (actor ? task).mapTo[Try[T]].map(_.get)
  }
}
