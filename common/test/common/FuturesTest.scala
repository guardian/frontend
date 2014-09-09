package common

import akka.actor.ActorSystem
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.time.{Span, Millis}
import org.scalatest.{Matchers, FlatSpec}

import scala.concurrent.duration._
import scala.concurrent.Future
import scala.language.postfixOps

import play.api.test._
import play.api.test.Helpers._

class FuturesTest extends FlatSpec with Matchers with ScalaFutures {
  val testAkka = ActorSystem("futures-test")

  "batchedTraverse" should "maintain order" in {
    Futures.batchedTraverse(1 to 100, 10)(Future.successful).futureValue shouldEqual (1 to 100).toSeq
  }

  it should "process a batch in parallel" in {
    running(FakeApplication()) {
      val singleBatch = Futures.batchedTraverse(List.fill(10)(()), 10)(_ =>
        Futures.completeAfter(testAkka.scheduler, 100 millis)
      )

      assert(singleBatch.isReadyWithin(Span(150, Millis)))
    }
  }

  it should "sequentially process batches" in {
    running(FakeApplication()) {
      val batches = Futures.batchedTraverse(List.fill(5)(()), 1)(_ =>
        Futures.completeAfter(testAkka.scheduler, 100 millis)
      )

      assert(!batches.isReadyWithin(Span(450, Millis)))
    }
  }
}
