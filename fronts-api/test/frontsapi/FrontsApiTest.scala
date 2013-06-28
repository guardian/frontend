package frontsapi

import org.scalatest.{BeforeAndAfter, FlatSpec}
import org.scalatest.matchers.ShouldMatchers

class FrontsApiTest extends FlatSpec with ShouldMatchers with BeforeAndAfter {

  var frontsApi: FrontsApi = null
  val testList = "testList"

  before {
    frontsApi = new FrontsApiMap
  }

  "FrontsApi" should "get an empty list for anything" in {
    frontsApi.getList("random") should be (Nil)
  }

  it should "let you insert into an empty list" in {
    frontsApi.add(testList, "abc")
    frontsApi.getList(testList) should be (List("abc"))
  }

  it should "let you add before something" in {
    frontsApi.add(testList, "abc")
    frontsApi.add(testList, "abc", "xyz")
    frontsApi.getList(testList) should be (List("xyz", "abc"))
  }

  it should "let you add something after something" in {
    frontsApi.add(testList, "abc")
    frontsApi.add(testList, "abc", "xyz", Some(true))
    frontsApi.getList(testList) should be (List("abc", "xyz"))
  }

  it should "let you add at a position" in {
    frontsApi.add(testList, "abc")
    frontsApi.addAtPosition(testList, 1, "xyz")
    frontsApi.getList(testList) should be (List("abc", "xyz"))

    frontsApi.addAtPosition(testList, 1, "123")
    frontsApi.getList(testList) should be (List("abc", "123", "xyz"))

    frontsApi.addAtPosition(testList, 0, "789")
    frontsApi.getList(testList) should be (List("789", "abc", "123", "xyz"))

    frontsApi.addAtPosition(testList, 10000, "theend")
    frontsApi.getList(testList) should be (List("789", "abc", "123", "xyz", "theend"))

    frontsApi.addAtPosition(testList, -10000, "thestart")
    frontsApi.getList(testList) should be (List("thestart", "789", "abc", "123", "xyz", "theend"))
  }

  it should "let you delete a list" in {
    frontsApi.add(testList, "xyz")
    frontsApi.removeList(testList)
    frontsApi.getList(testList) should be (Nil)
  }

  it should "let you delete an item from a list" in {
    frontsApi.add(testList, "abc")
    frontsApi.add(testList, "123")
    frontsApi.add(testList, "doreme")
    frontsApi.removeItem(testList, "123")
    frontsApi.getList(testList) should be (List("doreme", "abc"))
  }

}
