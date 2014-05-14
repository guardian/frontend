package dfp

import common.ExecutionContexts
import play.api.libs.json.Json._
import scala.concurrent.future
import play.api.libs.json._
import tools.Store

object DfpDataCacheJob extends ExecutionContexts {

  private implicit val dfpDataWrites = new Writes[DfpData] {
    def writes(data: DfpData): JsValue = {
      Json.obj(
        "sponsoredKeywords" -> data.sponsoredKeywords,
        "advertisedFeatureKeywords" -> data.advertisedFeatureKeywords
      )
    }
  }

  def run() {
    future {
      val lineItems = DfpApi.fetchCurrentLineItems()
      if (lineItems.nonEmpty) {
        val sponsoredKeywords = DfpApi.fetchSponsoredKeywordTargetingValues(lineItems)
        val advertisedFeatureKeywords = DfpApi.fetchAdvertisedFeatureKeywordTargetingValues(lineItems)
        val dfpData = DfpData(sponsoredKeywords, advertisedFeatureKeywords)
//        Store.putDfpData(stringify(toJson(dfpData)))
        println(stringify(toJson(dfpData)))
      }
    }
  }
}
