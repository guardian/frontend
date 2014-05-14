package dfp

import common.ExecutionContexts
import play.api.libs.json.Json._
import scala.concurrent.future
import tools.Store

object DfpDataCacheJob extends ExecutionContexts {

  // TODO implicit writes

  def run() {
    future {
      //val lineItems = DfpApi.fetchCurrentLineItems()
      //if (lineItems.nonEmpty) {
//        val keywords = DfpApi.fetchKeywordTargetingValues(lineItems)
        val sponsoredKeywords = Seq("a","b")
        val advertisedFeatureKeywords = Seq("b","c")
        val j = toJson(DfpData(sponsoredKeywords,advertisedFeatureKeywords))
        val s = stringify(j)
        println(s)
        //Store.putDfpData(stringify(toJson(keywords)))
      //}
    }
  }
}
