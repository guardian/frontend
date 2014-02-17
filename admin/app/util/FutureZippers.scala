package util

import scala.concurrent.Future
import common.ExecutionContexts


object FutureZippers extends ExecutionContexts {
  def zip[A, B](f1: Future[A], f2: Future[B]) =
    f1.zip(f2)

  def zip[A, B, C](f1: Future[A], f2: Future[B], f3: Future[C]): Future[(A, B, C)] =
    for {
      a <- f1
      b <- f2
      c <- f3
    } yield (a, b, c)

  def zip[A, B, C, D](f1: Future[A], f2: Future[B], f3: Future[C], f4: Future[D]): Future[(A, B, C, D)] =
    for {
      a <- f1
      b <- f2
      c <- f3
      d <- f4
    } yield (a, b, c, d)
}
