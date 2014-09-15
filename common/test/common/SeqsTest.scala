package common

import org.scalatest.{Matchers, FlatSpec}
import Seqs._

class SeqsTest extends FlatSpec with Matchers {
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
}
