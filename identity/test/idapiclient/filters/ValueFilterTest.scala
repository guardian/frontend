package client.filters

import org.scalatest.FunSuite
import org.scalatest.matchers.ShouldMatchers

class ValueFilterTest extends FunSuite with ShouldMatchers {
  test("value filter should return correct querystring params") {
    ValueFilter("testName", "testVal").parameters should contain(("filter", "testName:testVal"))
  }

  test("should only set one paramter") {
    ValueFilter("testName", "testVal").parameters.size should equal(1)
  }
}
