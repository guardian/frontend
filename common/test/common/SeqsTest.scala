package common

import org.scalatest.matchers.should.Matchers
import Seqs._
import org.scalatest.flatspec.AnyFlatSpec

class SeqsTest extends AnyFlatSpec with Matchers {
  "isDescending" should "return true for descending lists" in {
    Seq(3, 3, 3, 2, 1, 0, -2).isDescending shouldEqual true
  }

  it should "return false for ascending lists" in {
    Seq(-1, 2, 3, 10, 20).isDescending shouldEqual false
  }

  it should "return false for non-ordered lists" in {
    Seq(2, -1, 0, 10, -40).isDescending shouldEqual false
  }

  "reverseSorted" should "reverse sort a list" in {
    Seq(1, 5, 2, 3, -3).reverseSorted shouldEqual Seq(5, 3, 2, 1, -3)
  }

  "around" should "return a window around the desired item" in {
    Seq(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).around(0, 3)(_ == 3) shouldEqual Some(Seq(3, 4, 5))
    Seq(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).around(1, 3)(_ == 3) shouldEqual Some(Seq(2, 3, 4))
  }

  it should "return None if the item could not be found" in {
    Seq(1, 2, 3).around(0, 3)(_ == 10) shouldEqual None
  }
}
