package concurrent

import java.util.concurrent.Semaphore

import scala.concurrent.{ExecutionContext, Future}

class FutureSemaphore(maxOperations: Int) {
  private val semaphore = new Semaphore(maxOperations)

  def execute[A](task: => Future[A])(implicit ec: ExecutionContext): Future[A] = {
    if (semaphore.tryAcquire()) {
      val resultF = task
      resultF.onComplete(_ => semaphore.release())
      resultF
    } else {
      Future.failed(new FutureSemaphore.TooManyOperationsInProgress())
    }
  }
}

object FutureSemaphore {
  class TooManyOperationsInProgress extends Exception("Too many operations in progress, cannot execute task")
}
