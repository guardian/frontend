package util

import rx.lang.scala.Observable
import scala.util.{Try, Failure, Success}

object Observables {
  implicit class RichObservable[A](observable: Observable[A]) {
    /** Prevents errors from ending the stream, instead turning each value into either a Success of the value or a
      * Failure of the exception
      *
      * @return The Try observable
      */
    def tries: Observable[Try[A]] = observable.map(Success.apply).onErrorReturn(Failure.apply)
  }
}
