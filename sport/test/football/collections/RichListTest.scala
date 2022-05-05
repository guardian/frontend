package football.collections

import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.DoNotDiscover
import org.scalatest.matchers.should.Matchers
import test.ConfiguredTestSuite

@DoNotDiscover class RichListTest extends AnyFunSuite with Matchers with RichList with ConfiguredTestSuite {
  test("Should group simple List correctly") {
    val l = List(1, 1, 2, 3, 3, 3, 4, 5, 5)
    l.segment() should equal(
      List((1, List(1, 1)), (2, List(2)), (3, List(3, 3, 3)), (4, List(4)), (5, List(5, 5))),
    )
  }

  test("Can group on more complex keys") {
    val l = List(1, 1, 2, 3, 3, 3, 4, 5, 5)
    l.segmentBy(key = (i: Int) => i * 2) should equal(
      List((2, List(1, 1)), (4, List(2)), (6, List(3, 3, 3)), (8, List(4)), (10, List(5, 5))),
    )
  }

  test("can group on complex keys and map the resulting values") {
    val l = List(1, 1, 2, 3, 3, 3, 4, 5, 5)
    l.segmentByAndMap(key = (i: Int) => i * 2, mapValue = (i: Int) => i * 3) should equal(
      List((2, List(3, 3)), (4, List(6)), (6, List(9, 9, 9)), (8, List(12)), (10, List(15, 15))),
    )
  }

  test("indexOfOpt will return the index of an item in list") {
    val l = List(0, 1, 2, 3, 4)
    l.indexOfOpt(0) should equal(Some(0))
    l.indexOfOpt(4) should equal(Some(4))
  }

  test("indexOfOpt will return None if item is not in list") {
    val l = List(0, 1, 2)
    l.indexOfOpt(5) should equal(None)
  }
}
