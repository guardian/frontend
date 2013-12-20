package implicits

import java.util.concurrent.{Future => JavaFuture}
import scala.concurrent.{Promise, Future => ScalaFuture }
import scala.util.Success
import common.ExecutionContexts
import play.api.libs.concurrent.{Akka => PlayAkka}
import play.api.Play.current

trait Futures extends ExecutionContexts {

  private lazy val javaFutureContext = PlayAkka.system.dispatchers.lookup("play.akka.actor.java-futures")

  implicit class JavaFuture2ScalaFuture[T](f: JavaFuture[T]) {
    lazy val toScalaFuture: ScalaFuture[T] = {
      val s = Promise[T]()
      convert(f, s)
      s.future
    }
  }

  private def convert[T](java: JavaFuture[T], promise: Promise[T]) {
    if (java.isDone) {
      try {
        promise.complete(Success(java.get()))
      } catch {
        case t: Throwable => promise.failure(t)
      }
    } else {
      ScalaFuture {convert(java, promise)}(javaFutureContext)
    }
  }
}
