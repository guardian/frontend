package util

import org.scalatest.{ShouldMatchers, FlatSpec}
import scala.concurrent.Future
import scala.util.{Success, Failure}
import Futures._

class RichFutureTest extends FlatSpec with ShouldMatchers {
  "mapTry" should "transform a failed Future into a Future of Failure of the error" in {
    val error = new RuntimeException("Blargh!")
    Future.failed(error).mapTry should equal(Future.successful(Failure(error)))
  }

  it should "transform a completed Future into Future of Success of the value" in {
    Future.successful(1).mapTry should equal(Future.successful(Success(1)))
  }
}
