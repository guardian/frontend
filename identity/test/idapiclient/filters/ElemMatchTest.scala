package client.filters

import org.scalatest.funsuite.AnyFunSuite
import org.scalatest.matchers.should.Matchers

class ElemMatchTest extends AnyFunSuite with Matchers {
  test("should add elemMatch with a single filter") {
    val elemMatch = ElemMatch("arrayPath", List(ElemMatchFilter("fieldPath", "value")))
    elemMatch.parameters should contain(("elemMatch", "arrayPath"))
    elemMatch.parameters should contain(("elemMatchFilter", "fieldPath:value"))
    elemMatch.parameters.size should equal(2)
  }

  test("should add elemMatch with multiple filters") {
    val elemMatch =
      ElemMatch("arrayPath", List(ElemMatchFilter("fieldPath", "value"), ElemMatchFilter("field2Path", "value2")))
    elemMatch.parameters should contain(("elemMatch", "arrayPath"))
    elemMatch.parameters should contain(("elemMatchFilter", "fieldPath:value"))
    elemMatch.parameters should contain(("elemMatchFilter", "field2Path:value2"))
    elemMatch.parameters.size should equal(3)
  }

  test("should fail to craete ElemMatch with no filters") {
    an[IllegalArgumentException] should be thrownBy {
      ElemMatch("arrayPath", Nil)
    }
  }
}
