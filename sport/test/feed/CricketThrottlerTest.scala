package feed

import akka.actor.ActorSystem
import cricket.feed.CricketThrottler
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{FlatSpec, Matchers}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CricketThrottlerTest extends FlatSpec with Matchers with ScalaFutures {

  // Only writing a simple test case since throttling slows things down
  "throttle" should "execute a future and return the result" in {
    val system = ActorSystem()
    val cricketThrottler = new CricketThrottler(system)
    whenReady(cricketThrottler.throttle(() => Future(5))) { _ shouldBe 5}
  }
}
