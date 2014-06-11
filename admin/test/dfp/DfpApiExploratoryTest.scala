package dfp

import org.scalatest.FlatSpec
import org.scalatest.Matchers
import play.api.test.FakeApplication
import play.api.test.Helpers._
import com.google.api.ads.dfp.axis.v201403.{LineItem => DfpApiLineItem, AdUnit, AdUnitTargeting}

class DfpApiSpec extends FlatSpec with Matchers {
  ignore should "grab list of all available line items" in {
    running(FakeApplication()) {
      val dfpLineItems: Seq[DfpApiLineItem] = DfpApi.getAllCurrentDfpLineItems()
      dfpLineItems.size shouldEqual(1832)

      dfpLineItems
    }
  }

  ignore should "get ad units targetted by page skins" in running(FakeApplication()) {
    val adUnits: Seq[String] = DfpApi.fetchAdUnitsThatAreTargettedByPageSkins()

    for(item <- adUnits) {
      println(item)
    }
  }

  ignore should "grab ad units for list of Ids provided" in running(FakeApplication()) {
    val pageSkinIds: List[String] = List("59357607", "59357607", "59357607", "59342247", "59360247",
      "59360247", "59360007", "59360367", "59360007", "59360007", "59359887").distinct

    println("here are the pageskinIds: " + pageSkinIds)
    val adUnits: Seq[AdUnit] = DfpApi.getAdUnitsForTheseIds(pageSkinIds).filterNot(_.getName != "front")
    
    for (unit <- adUnits) {
      val parents: Array[String] = unit.getParentPath.tail.map(_.getName)

      println((parents :+ unit.getName).mkString(" > ") )
    }
  }
  
}
