package util

import org.scalatest.concurrent.ScalaFutures
import org.scalatest.{DoNotDiscover, FlatSpec, ShouldMatchers}
import test.ConfiguredTestSuite
import util.Futures._

import scala.concurrent.Future
import scala.util.{Failure, Success}

@DoNotDiscover class RichFutureTest extends FlatSpec with ShouldMatchers with ScalaFutures with ConfiguredTestSuite {
  "mapTry" should "transform a failed Future into a Future of Failure of the error" in {
    val error = new RuntimeException("Blargh!")
    Future.failed(error).mapTry.futureValue should equal(Failure(error))
  }

  it should "transform a completed Future into Future of Success of the value" in {
    Future.successful(1).mapTry.futureValue should equal(Success(1))
  }
}
