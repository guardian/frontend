package client.filters

import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.matchers.should.Matchers

class OrderByTest extends AnyFunSuite with Matchers {
  test("should apply order by") {
    OrderBy("field").parameters should contain(("orderBy", "field"))
  }

  test("should apply ordering") {
    OrderBy("field", 1).parameters should contain(("order", "1"))
  }

  test("can apply default ordering") {
    OrderBy("field").parameters should contain(("order", "-1"))
  }

  test("should apply order and ordering and nothing else") {
    OrderBy("field", 1).parameters.size should equal(2)
  }
}
