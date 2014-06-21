package dfp

import common.ExecutionContexts
import play.api.libs.json.Json._
import scala.concurrent.future
import tools.Store
import play.api.libs.json.{Json, JsValue, Writes}
import model.AdReports

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

  private implicit val lineItemWrites = new Writes[LineItem] {
    def writes(lineItem: LineItem ): JsValue = {
      Json.obj(
        "id" -> lineItem.id,
        "sponsor" -> lineItem.sponsor,
        "targetSets" -> lineItem.targetSets
      )
    }
  }

  private implicit val sponsorshipWrites = new Writes[Sponsorship] {
    def writes(sponsorship: Sponsorship): JsValue = {
      Json.obj(
        "sponsor" -> sponsorship.sponsor,
        "tags" -> sponsorship.tags
      )
    }
  }

  def run() {
    future {
      val dfpLineItems = DfpApi.getAllCurrentDfpLineItems
      if (dfpLineItems.nonEmpty) {
        val lineItems = DfpApi.hydrateWithUsefulValues(dfpLineItems)

        val sponsoredTags: Seq[Sponsorship] = DfpApi.filterOutSponsoredTagsFrom(lineItems)
        Store.putDfpSponsoredTags(stringify(toJson(sponsoredTags)))
        AdReports.updateSponsoredTags(sponsoredTags)

        val advertisementTags: Seq[Sponsorship] = DfpApi.filterOutAdvertisementFeatureTagsFrom(lineItems)
        Store.putDfpAdvertisementFeatureTags(stringify(toJson(advertisementTags)))
        AdReports.updateAdvertisementTags(advertisementTags)

        Store.putDfpPageSkinAdUnits(stringify(toJson(DfpApi.fetchAdUnitsThatAreTargettedByPageSkins(dfpLineItems))))

        Store.putDfpLineItemsReport(stringify(toJson(lineItems)))
      }
    }
  }
}
