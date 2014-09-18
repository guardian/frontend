package client.filters

import org.scalatest.{DoNotDiscover, FunSuite, Matchers}
import test.ConfiguredTestSuite

@DoNotDiscover class ValueFilterTest extends FunSuite with Matchers with ConfiguredTestSuite {
  test("value filter should return correct querystring params") {
    ValueFilter("testName", "testVal").parameters should contain(("filter", "testName:testVal"))
  }

  test("should only set one paramter") {
    ValueFilter("testName", "testVal").parameters.size should equal(1)
  }
}
