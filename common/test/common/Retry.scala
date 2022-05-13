package common

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import scala.util.{Failure, Success}

class RetryTest extends AnyFlatSpec with Matchers {
  val onFail = (_: Throwable, _: Int) => ()

  it should "execute code once even if n is 0" in {
    Retry(0)("hello")(onFail) should be(Success("hello"))
  }

  it should "execute failing code n times" in {
    var n = 0
    val e = new Exception("problem")

    Retry(3) {
      n = n + 1
      throw e
    }(onFail) should be(Failure(e))

    n should be(3)
  }

  it should "only execute code once if it immediately succeeds" in {
    var n = 0

    Retry(3) {
      n = n + 1
      "hello"
    }(onFail) should be(Success("hello"))

    n should be(1)
  }
}
