package dfp

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.FakeApplication
import play.api.test.Helpers._
import com.google.api.ads.dfp.axis.v201403.{LineItem => DfpApiLineItem, CreativePlaceholder}

class DfpApiSpec extends FlatSpec with Matchers {
  ignore should "grab list of all available line items" in {
    running(FakeApplication()) {
      val dfpLineItems: Seq[DfpApiLineItem] = DfpApi.getAllCurrentDfpLineItems()
      dfpLineItems.size shouldEqual(1832)

      dfpLineItems
    }
  }

  ignore should "be able to grab all line items that target 'out of page' slots" in running(FakeApplication()) {
    val slots: Seq[DfpApiLineItem] = DfpApi.fetchCurrentLineItemsWithOutOfPageSlots()

    for (item <- slots) {
      println(item.getId())
    }

    slots.size shouldEqual(11)

  }

  ignore should "extract the URL targets from the line items" in running(FakeApplication()) {
    val ids: Seq[String] = DfpApi.fetchAdUnitIdsThatAreTargettedByPageSkins()

    val expected: List[String] = List("59357607", "59357607", "59357607", "59342247", "59360247",
      "59360247", "59360007", "59360367", "59360007", "59360007", "59359887")

    ids.size shouldEqual(expected.size)
    for(item <- ids) {
      expected should contain(item)
    }
  }

  "DfpApi" should "grab ad units for list of Ids provided" in running(FakeApplication()) {
    List("59357607", "59357607", "59357607", "59342247", "59360247",
      "59360247", "59360007", "59360367", "59360007", "59360007", "59359887")
  }
}
