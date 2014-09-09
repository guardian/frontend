package common

import akka.actor.Scheduler

import scala.concurrent.{Promise, Future}
import scala.annotation.tailrec
import scala.concurrent.duration.FiniteDuration

object Futures extends ExecutionContexts {
  def batchedTraverse[A, B](as: Seq[A], batchSize: Int)(f: A => Future[B]): Future[Seq[B]] = {
    require(batchSize > 0, "Batch size must be greater than 0")

    @tailrec
    def iter(as: Seq[Seq[A]], acc: Future[Seq[B]]): Future[Seq[B]] = as match {
      case Nil => acc

      case batch +: remainingBatches =>
        iter(remainingBatches, acc flatMap { h =>
          Future.traverse(batch)(f) map { t =>
            h ++ t
          }
        })
    }

    iter(as.grouped(batchSize).toSeq, Future.successful(Seq.empty[B]))
  }

  def completeAfter(scheduler: Scheduler, delay: FiniteDuration): Future[Unit] = {
    val promise = Promise[Unit]()

    scheduler.scheduleOnce(delay) {
      promise.success(())
    }

    promise.future
  }
}
