package dfp

import common.ExecutionContexts
import play.api.libs.json.Json._
import scala.concurrent.future
import tools.Store
import play.api.libs.json.{Json, JsValue, Writes}
import model.AdReports
import org.joda.time.DateTime
import implicits.Dates

object DfpDataCacheJob extends ExecutionContexts with Dates{

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

  def run() {
    future {
      val dfpLineItems = DfpApi.getAllCurrentDfpLineItems
      if (dfpLineItems.nonEmpty) {
        val now = DateTime.now().toHttpDateTimeString
        val lineItems = DfpApi.hydrateWithUsefulValues(dfpLineItems)

        val sponsoredTags: Seq[Sponsorship] = DfpApi.filterOutSponsoredTagsFrom(lineItems)
        Store.putDfpSponsoredTags(stringify(SponsorshipReport(now, sponsoredTags).toJson))

        val advertisementTags: Seq[Sponsorship] = DfpApi.filterOutAdvertisementFeatureTagsFrom(lineItems)
        Store.putDfpAdvertisementFeatureTags(stringify(SponsorshipReport(now, advertisementTags).toJson))

        val pageSkinSponsorships: Seq[PageSkinSponsorship] = DfpApi.fetchAdUnitsThatAreTargettedByPageSkins(dfpLineItems)
        Store.putDfpPageSkinAdUnits(stringify(PageSkinSponsorshipReport(now, pageSkinSponsorships).toJson))

        Store.putDfpLineItemsReport(stringify(toJson(lineItems)))
      }
    }
  }
}
