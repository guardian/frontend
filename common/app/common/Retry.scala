package common

import scala.util.{Failure, Success, Try}

object Retry {
  /**
    * Execute some code n times, or until no exception is thrown
    * (If n is 0, code still gets executed once)
    */
  def apply[T](n: Int)(r: => T)(onFail: (Throwable, Int) => Unit): Try[T] = {
    def go(i: Int): Try[T] = {
      Try(r) match {
        case Failure(e) if i < n =>
          onFail(e, i)
          go(i + 1)
        case f @ Failure(e) =>
          onFail(e, i)
          f
        case s: Success[T] => s
      }
    }

    go(1)
  }
}
