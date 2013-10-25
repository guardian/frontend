package client.connection.util

import scala.concurrent.{ExecutionContext, Future}

trait ApiHelpers {
  implicit def executionContext: ExecutionContext

  /**
   * Make 2 API calls at the same time, combining their results
   */
  def multiple[L, A, B](arg: (Future[Either[L, A]], Future[Either[L, B]])): Future[Either[L, (A, B)]] =
    arg match { case (f1, f2) =>
      f1.zip(f2) map { case (e1, e2) =>
        for (a <- e1.right; b <- e2.right) yield (a, b)
      }
    }
}
