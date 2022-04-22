package common

import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

class PaginationTest extends AnyFlatSpec with Matchers {

  it should "return the correct set of pages for pagination navigation" in {
    Pagination(1, 10, 1000).pages should be(List(1, 2, 3, 4))
    Pagination(2, 10, 1000).pages should be(List(1, 2, 3, 4))
    Pagination(3, 10, 1000).pages should be(List(1, 2, 3, 4))
    Pagination(4, 10, 1000).pages should be(List(3, 4, 5))
    Pagination(5, 10, 1000).pages should be(List(4, 5, 6))
    Pagination(6, 10, 1000).pages should be(List(5, 6, 7))
    Pagination(7, 10, 1000).pages should be(List(6, 7, 8))
    Pagination(8, 10, 1000).pages should be(List(7, 8, 9, 10))
    Pagination(9, 10, 1000).pages should be(List(7, 8, 9, 10))
    Pagination(10, 10, 1000).pages should be(List(7, 8, 9, 10))

    Pagination(1, 5, 1000).pages should be(List(1, 2, 3, 4, 5))
  }

  it should "handle short runs" in {
    Pagination(1, 1, 1000).pages should be(Seq(1))

    Pagination(1, 3, 1000).pages should be(Seq(1, 2, 3))
    Pagination(2, 3, 1000).pages should be(Seq(1, 2, 3))
    Pagination(3, 3, 1000).pages should be(Seq(1, 2, 3))
  }
}
