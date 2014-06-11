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

  "DfpAPI" should "be able to grab all line items that target 'out of page' slots" in running(FakeApplication()) {
    val slots: Seq[DfpApiLineItem] = DfpApi.fetchCurrentLineItemsWithOutOfPageSlots()

    for (item <- slots) {
      println(item.getId())
    }

    slots.size shouldEqual(0)

  }
}
