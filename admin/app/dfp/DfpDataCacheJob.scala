package dfp

import common.ExecutionContexts
import play.api.libs.json.Json._
import scala.concurrent.future
import tools.Store

object DfpDataCacheJob extends ExecutionContexts {

  def run() {
    future {
      val lineItems = DfpApi.fetchCurrentLineItems()
      if (lineItems.nonEmpty) {
        val keywords = DfpApi.fetchKeywordTargetingValues(lineItems)
        Store.putDfpData(stringify(toJson(keywords)))
      }
    }
  }
}
