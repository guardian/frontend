package concurrent

import akka.actor.ActorSystem
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{FlatSpec, Matchers}

class BlockingOperationsTest extends FlatSpec with Matchers with ScalaFutures {
  val system = ActorSystem()

  "BlockingOperations" should "execute blocks in a thread pool" in {
    val blockingOperaitons = new BlockingOperations(system)
    whenReady(blockingOperaitons.executeBlocking(5))(_ shouldBe 5)
  }
}
