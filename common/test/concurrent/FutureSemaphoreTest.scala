package concurrent

import akka.actor.ActorSystem
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{FlatSpec, Matchers}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success}

class FutureSemaphoreTest extends FlatSpec with Matchers with ScalaFutures {
  implicit val actorSystem: ActorSystem = ActorSystem()

  // These tests are horrid, perhaps they should not be included

  "FutureSemaphore" should "complete 4 out of 4 tasks when threshold is 4" in {
    val actor = FutureSemaphore.actorRef(4)
    whenReady {
      Future.traverse(1 to 4)(_ => FutureSemaphore.executeTask(actor, Future(Thread.sleep(2))))
    } (result => result.length shouldBe 4)
  }

  it should "complete 4 out of 5 tasks when threshold is 4" in {
    val actor = FutureSemaphore.actorRef(4)
    whenReady {
      Future.traverse(1 to 5)(i =>
        FutureSemaphore.executeTask(actor, Future {
          Thread.sleep(2)
          Success(i)
        }).recover {
          case e => Failure(e)
        }
      )
    } { result =>
      result.count(_.isSuccess) shouldBe 4
    }
  }
}
