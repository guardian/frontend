package client.filters

import org.scalatest.FunSuite
import org.scalatest.Matchers

class PaginationTest extends FunSuite with Matchers {
  test("should apply page number") {
    Pagination(2).parameters should contain(("page", "2"))
  }

  test("should apply page number and size") {
    val pagination = Pagination(2, 15)
    pagination.parameters should contain(("page", "2"))
    pagination.parameters should contain(("pageSize", "15"))

  }

  test("sets a default page size if a pagination filter is used") {
    val pagination = Pagination(3)
    pagination.parameters should contain(("page", "3"))
    pagination.parameters should contain(("pageSize", "20"))
  }

  test("should set two parameters") {
    Pagination(4).parameters.size should equal(2)
  }
}
