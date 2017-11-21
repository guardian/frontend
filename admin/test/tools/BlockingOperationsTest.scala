package tools

import akka.actor.ActorSystem
import org.scalatest.{FlatSpec, Matchers}
import org.scalatest.concurrent.ScalaFutures

class BlockingOperationsTest extends FlatSpec with Matchers with ScalaFutures {
  val system = ActorSystem()

  "BlockingOperations" should "execute blocks in a thread pool" in {
    val blockingOperaitons = new BlockingOperations(system)
    whenReady(blockingOperaitons.executeBlocking(5))(_ shouldBe 5)
  }
}
