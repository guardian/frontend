package common

import org.scalatest.{Matchers, FlatSpec}

class PaginationTest extends FlatSpec with Matchers {

  it should "return the correct set of pages for pagination navigation" in {
    Pagination(1, 10).pages should be (List(1,2,3,4,5))
    Pagination(2, 10).pages should be (List(1,2,3,4,5))
    Pagination(3, 10).pages should be (List(1,2,3,4,5))
    Pagination(4, 10).pages should be (List(2,3,4,5,6))
    Pagination(5, 10).pages should be (List(3,4,5,6,7))
    Pagination(6, 10).pages should be (List(4,5,6,7,8))
    Pagination(7, 10).pages should be (List(5,6,7,8,9))
    Pagination(8, 10).pages should be (List(6,7,8,9,10))
    Pagination(9, 10).pages should be (List(6,7,8,9,10))
    Pagination(10, 10).pages should be (List(6,7,8,9,10))

    Pagination(100, 1000).pages should be (List(98,99,100,101,102))
    Pagination(101, 1000).pages should be (List(99,100,101,102,103))
  }

  it should "handle short runs" in {
    Pagination(1,1).pages should be (Seq(1))

    Pagination(1,3).pages should be (Seq(1,2,3))
    Pagination(2,3).pages should be (Seq(1,2,3))
    Pagination(3,3).pages should be (Seq(1,2,3))
  }
}
