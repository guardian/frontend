package concurrent

import java.util.concurrent.Semaphore

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Try}

class FutureSemaphore(maxOperations: Int) {
  private val semaphore = new Semaphore(maxOperations)

  def execute[A](task: => Future[A])(implicit ec: ExecutionContext): Future[Try[A]] = {
    if (semaphore.tryAcquire()) {
      val resultF = task.map(Try(_)).recover { case e => Failure(e) }
      resultF.foreach(_ => semaphore.release())
      resultF
    } else {
      Future.successful(Failure(FutureSemaphore.TooManyOperationsInProgress))
    }
  }
}

object FutureSemaphore {
  case object TooManyOperationsInProgress extends Exception("Too many operations in progress, cannot execute task")
}
