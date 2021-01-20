import com.amazonaws.handlers.AsyncHandler

import scala.concurrent.{Future, Promise}
import scala.util.{Success, Failure}
import java.util.concurrent.{Future => JavaFuture}

package object awswrappers {
  private[awswrappers] def createHandler[A <: com.amazonaws.AmazonWebServiceRequest, B]() = {
    val promise = Promise[B]()

    val handler = new AsyncHandler[A, B] {
      override def onSuccess(request: A, result: B): Unit = promise.complete(Success(result))

      override def onError(exception: Exception): Unit = promise.complete(Failure(exception))
    }

    (promise.future, handler)
  }

  private[awswrappers] def asFuture[A <: com.amazonaws.AmazonWebServiceRequest, B](
      block: AsyncHandler[A, B] => JavaFuture[B],
  ): Future[B] = {
    val (future, handler) = createHandler[A, B]()

    block(handler)

    future
  }
}
