package common

import scala.concurrent.Future
import scala.annotation.tailrec

object Futures extends ExecutionContexts {
  def batchedTraverse[A, B](as: Seq[A], batchSize: Int)(f: A => Future[B]): Future[Seq[B]] = {
    require(batchSize > 0, "Batch size must be greater than 0")

    @tailrec
    def iter(as: Seq[Seq[A]], acc: Future[Seq[B]]): Future[Seq[B]] = as.toList match {
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
}
