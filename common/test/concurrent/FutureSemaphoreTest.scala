package concurrent

import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{FlatSpec, Matchers}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class FutureSemaphoreTest extends FlatSpec with Matchers with ScalaFutures {

  def executeSomeTasks[T](futureSemaphore: FutureSemaphore, numberToExecute: Int)(task: => Future[T]): Future[Seq[Try[T]]] = {
    Future.traverse(1 to numberToExecute)(_ =>
      futureSemaphore.execute[Try[T]](
        Future(Thread.sleep(10)).flatMap(_ => task).map(Success(_))
      ).recover { case e => Failure(e) }
    )
  }

  "FutureSemaphore" should "complete 4 out of 4 tasks when threshold is 4" in {
    val futureSemaphore = new FutureSemaphore(4)
    whenReady {
      executeSomeTasks(futureSemaphore, 4)(Future(1))
    } { result =>
      result.count(_.isSuccess) shouldBe 4
      result.count(_.isFailure) shouldBe 0
    }
  }

  it should "complete 4 out of 5 tasks when threshold is 4" in {
    val futureSemaphore = new FutureSemaphore(4)
    whenReady {
      executeSomeTasks(futureSemaphore, 5)(Future(1))
    } { result =>
      result.count(_.isSuccess) shouldBe 4
      result.count(_.isFailure) shouldBe 1
    }
  }

  it should "complete 4 out of 5 tasks, then complete the remaining 4" in {
    val futureSemaphore = new FutureSemaphore(4)
    whenReady {
      executeSomeTasks(futureSemaphore, 5)(Future(1))
    } { result =>
      result.count(_.isSuccess) shouldBe 4
      result.count(_.isFailure) shouldBe 1
    }

    whenReady {
      executeSomeTasks(futureSemaphore, 4)(Future(1))
    } { result =>
      result.count(_.isSuccess) shouldBe 4
      result.count(_.isFailure) shouldBe 0
    }
  }

  it should "reset the semaphore after failing tasks, then complete the remaining 4" in {
    val futureSemaphore = new FutureSemaphore(4)
    whenReady {
      executeSomeTasks(futureSemaphore, 5)(Future(throw new RuntimeException()))
    } { result =>
      result.count(_.isSuccess) shouldBe 0
      result.count(_.isFailure) shouldBe 5
    }

    whenReady {
      executeSomeTasks(futureSemaphore, 4)(Future(1))
    } { result =>
      result.count(_.isSuccess) shouldBe 4
      result.count(_.isFailure) shouldBe 0
    }
  }
}
