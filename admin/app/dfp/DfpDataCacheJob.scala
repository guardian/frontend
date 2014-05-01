package dfp

import common.ExecutionContexts
import play.api.libs.json.Json
import scala.concurrent.future

object DfpDataCacheJob extends ExecutionContexts {

  def run() {
    future {
      val lineItems = DfpApi.fetchCurrentLineItems()
      println(lineItems)
      println("keywords")
      val keywords = DfpApi.fetchSponsoredSlotKeywordTargetingValues(lineItems)
      println(keywords)
      val json = Json.toJson(keywords)
      println(json)
      //Store.putDfpData(json)
    }
  }
}
