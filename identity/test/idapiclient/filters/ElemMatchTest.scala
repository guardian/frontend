package client.filters

import org.scalatest.FunSuite
import org.scalatest.Matchers

class ElemMatchTest extends FunSuite with Matchers {
  test("should add elemMatch with a single filter") {
    val elemMatch = ElemMatch("arrayPath", List(ElemMatchFilter("fieldPath", "value")))
    elemMatch.parameters should contain(("elemMatch", "arrayPath"))
    elemMatch.parameters should contain(("elemMatchFilter", "fieldPath:value"))
    elemMatch.parameters.size should equal(2)
  }

  test("should add elemMatch with multiple filters") {
    val elemMatch = ElemMatch("arrayPath", List(ElemMatchFilter("fieldPath", "value"), ElemMatchFilter("field2Path", "value2")))
    elemMatch.parameters should contain(("elemMatch", "arrayPath"))
    elemMatch.parameters should contain(("elemMatchFilter", "fieldPath:value"))
    elemMatch.parameters should contain(("elemMatchFilter", "field2Path:value2"))
    elemMatch.parameters.size should equal(3)
  }

  test("should fail to craete ElemMatch with no filters") {
    evaluating {
      ElemMatch("arrayPath", Nil)
    } should produce[IllegalArgumentException]
  }
}
