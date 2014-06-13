package dfp

import common.ExecutionContexts
import play.api.libs.json.Json._
import scala.concurrent.future
import tools.Store

object DfpDataCacheJob extends ExecutionContexts {

  def run() {
    future {
      val dfpLineItems = DfpApi.getAllCurrentDfpLineItems()
      if (dfpLineItems.nonEmpty) {
        val lineItems = DfpApi.wrapIntoDomainLineItem(dfpLineItems)
        Store.putDfpSponsoredKeywords(stringify(toJson(DfpApi.fetchSponsoredKeywords(lineItems))))
        Store.putDfpAdvertisementFeatureKeywords(stringify(toJson(DfpApi.fetchAdvertisementFeatureKeywords(lineItems))))
        Store.putDfpPageSkinAdUnits(stringify(toJson(DfpApi.fetchAdUnitsThatAreTargettedByPageSkins(dfpLineItems))))
      }
    }
  }
}
