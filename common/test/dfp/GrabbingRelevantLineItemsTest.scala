package dfp

import com.google.api.ads.dfp.axis.v201403._
import conf.{Configuration => GuConf}
import org.scalatest._
import scala.language.reflectiveCalls
import services.DfpApi


class GrabbingRelevantLineItemsTest extends FlatSpec with Matchers {

  "DFP Api" should "return the list of line items that will be displayed today" in {
    val results: Seq[LineItem] = DfpApi.fetchCurrentLineItems()

    results.size should be > 1000
  }

  "DFP Api" should "allow us to get the keywords associated" in {
    val results: Seq[LineItem] = DfpApi.fetchCurrentLineItems()

    // everything should have some sort of targetting, but not everything has custom targetting.
    val stuffWithTargeting: Seq[LineItem] = results
      .filter(_.getTargeting != null)
      .filter(_.getTargeting.getCustomTargeting != null)

    stuffWithTargeting.size should (be > 1000 and be < results.size)

    val customTargeting = DfpApi.getCustomTargeting(stuffWithTargeting(0))
    customTargeting.get("Keywords").get should (contain("drink") and contain("food"))
  }
}
