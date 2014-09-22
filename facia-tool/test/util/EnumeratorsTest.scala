package util

import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{DoNotDiscover, FlatSpec, ShouldMatchers}
import play.api.libs.iteratee.Iteratee
import test.ConfiguredTestSuite
import util.Enumerators._

import scala.concurrent.Future

@DoNotDiscover class EnumeratorsTest extends FlatSpec with ShouldMatchers with ScalaFutures with ConfiguredTestSuite {
  "enumerate" should "simply enumerate the list if the function applied lifts the value into a Future" in {
    enumerate(List(1, 2, 3))(Future.successful).run(Iteratee.getChunks).futureValue should equal(List(
      1, 2, 3
    ))
  }

  it should "transform the enumerator with the given function" in {
    enumerate(List(1, 2, 3)) { n =>
      Future {
        n * n
      }
    }.run(Iteratee.getChunks).futureValue should equal(List(1, 4, 9))
  }
}
