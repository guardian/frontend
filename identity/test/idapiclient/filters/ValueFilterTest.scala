package client.filters

import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.matchers.should.Matchers

class ValueFilterTest extends AnyFunSuite with Matchers {
  test("value filter should return correct querystring params") {
    ValueFilter("testName", "testVal").parameters should contain(("filter", "testName:testVal"))
  }

  test("should only set one paramter") {
    ValueFilter("testName", "testVal").parameters.size should equal(1)
  }
}
