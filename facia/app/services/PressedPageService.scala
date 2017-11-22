package services

import java.nio.ByteBuffer
import java.util.concurrent.TimeUnit

import akka.actor.{Actor, ActorRef, ActorSystem, Props}
import boopickle.Default._
import common.Logging
import concurrent.BlockingOperations
import model.PressedPage
import akka.pattern.{PipeToSupport, ask}
import akka.util.Timeout
import protocol.BinaryPressedPageProtocol

import scala.concurrent.{ExecutionContext, Future}
import scala.reflect.ClassTag
import scala.util.{Failure, Success, Try}

class ConcurrencyLimiter(maxOperations: Int)(implicit ec: ExecutionContext) extends Actor with PipeToSupport {
  import ConcurrencyLimiter._

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
      executeTask(task, sender) pipeTo self
    }
  }
}

object ConcurrencyLimiter {
  case class ConcurrentTask[+T](task: () => Future[T])
  private case class ConcurrentResult[+T](result: Try[T], sender: ActorRef)
  private def executeTask[T](concurrentTask: ConcurrentTask[T], sender: ActorRef)(implicit ec: ExecutionContext): Future[ConcurrentResult[T]] = {
    concurrentTask.task().map(Success.apply).recover {
      case e => Failure(e)
    }.map(ConcurrentResult(_, sender))
  }

  def props(maxOperations: Int)(implicit ec: ExecutionContext): Props = {
    Props(new ConcurrencyLimiter(maxOperations))
  }

  def executeTask[T](actor: ActorRef, t: => Future[T])(implicit tag: ClassTag[Try[T]], timeout: Timeout, ec: ExecutionContext): Future[T] = {
    val task = ConcurrencyLimiter.ConcurrentTask(() => t)
    (actor ? task).mapTo[Try[T]].map(_.get)
  }
}


class PressedPageService(actorSystem: ActorSystem, blockingOperations: BlockingOperations)
                        (implicit ec: ExecutionContext) extends Logging with BinaryPressedPageProtocol {

  private val concurrencyLimiterActor: ActorRef = actorSystem.actorOf(ConcurrencyLimiter.props(30))

  def findPressedPage(path: String)(implicit ec: ExecutionContext): Future[Option[PressedPage]] = {
    implicit val timeout: Timeout = Timeout(10, TimeUnit.SECONDS)
    ConcurrencyLimiter.executeTask(concurrencyLimiterActor, findPressedPageFromS3(path))
  }

  private def findPressedPageFromS3(path: String): Future[Option[PressedPage]] = {
    val resultF = blockingOperations.executeBlocking {
      S3.getBytes(path).map { bytes =>
        Unpickle[PressedPage].fromBytes(ByteBuffer.wrap(bytes))
      }
    }
    resultF.failed.foreach { e =>
      log.error(s"Failed to get pressed page for $path", e)
    }
    resultF
  }
}
