package dfp

import common.ExecutionContexts
import play.api.libs.json.Json._
import scala.concurrent.future
import tools.Store
import play.api.libs.json.{Json, JsValue, Writes}

object DfpDataCacheJob extends ExecutionContexts {


  private implicit val targetWrites = new Writes[Target] {
    def writes(target: Target): JsValue = {
      Json.obj(
        "name" -> target.name,
        "op" -> target.op,
        "values" -> target.values
      )
    }
  }

  private implicit val targetSetWrites = new Writes[TargetSet] {
    def writes(targetSet: TargetSet): JsValue = {
      Json.obj(
        "op" -> targetSet.op,
        "targets" -> targetSet.targets
      )
    }
  }

  private implicit val adWrites = new Writes[LineItem] {
    def writes(lineItem: LineItem ): JsValue = {
      Json.obj(
        "id" -> lineItem.id,
        "targetSets" -> lineItem.targetSets
      )
    }
  }

  def run() {
    future {
      val dfpLineItems = DfpApi.getAllCurrentDfpLineItems()
      if (dfpLineItems.nonEmpty) {
        val lineItems = DfpApi.hydrateWithUsableValues(dfpLineItems)
        Store.putDfpSponsoredTags(stringify(toJson(DfpApi.filterOutSponsoredTagsFrom(lineItems))))
        Store.putDfpAdvertisementFeatureTags(stringify(toJson(DfpApi.filterOutAdvertisementFeatureTagsFrom(lineItems))))

        Store.putDfpPageSkinAdUnits(stringify(toJson(DfpApi.fetchAdUnitsThatAreTargettedByPageSkins(dfpLineItems))))

        Store.putDfpLineItemsReport(stringify(toJson(lineItems)))
      }
    }
  }
}
