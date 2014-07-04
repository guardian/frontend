package dfp

import common.ExecutionContexts
import implicits.Dates
import org.joda.time.DateTime
import play.api.libs.json.Json.{toJson, _}
import play.api.libs.json.{JsValue, Json, Writes}
import tools.Store

import scala.concurrent.future

object DfpDataCacheJob extends ExecutionContexts with Dates{

  private implicit val customTargetWrites = new Writes[CustomTarget] {
    def writes(target: CustomTarget): JsValue = {
      Json.obj(
        "name" -> target.name,
        "op" -> target.op,
        "values" -> target.values
      )
    }
  }

  private implicit val customTargetSetWrites = new Writes[CustomTargetSet] {
    def writes(targetSet: CustomTargetSet): JsValue = {
      Json.obj(
        "op" -> targetSet.op,
        "targets" -> targetSet.targets
      )
    }
  }

  private implicit val geoTargetWrites = new Writes[GeoTarget] {
    def writes(geoTarget: GeoTarget): JsValue = {
      Json.obj(
        "id" -> geoTarget.id,
        "parentId" -> geoTarget.parentId,
        "locationType" -> geoTarget.locationType,
        "name" -> geoTarget.name
      )
    }
  }

  private implicit val adUnitWrites = new Writes[GuAdUnit] {
    def writes(adUnit: GuAdUnit): JsValue = {
      Json.obj(
        "id" -> adUnit.id,
        "path" -> adUnit.path
      )
    }
  }

  private implicit val targetingWrites = new Writes[GuTargeting] {
    def writes(targeting: GuTargeting): JsValue = {
      Json.obj(
        "adUnits" -> targeting.adUnits,
        "geoTargets" -> targeting.geoTargets,
        "customTargetSets" -> targeting.customTargetSets
      )
    }
  }

  private implicit val lineItemWrites = new Writes[GuLineItem] {
    def writes(lineItem: GuLineItem ): JsValue = {
      Json.obj(
        "id" -> lineItem.id,
        "name" -> lineItem.name,
        "isPageSkin" -> lineItem.isPageSkin,
        "sponsor" -> lineItem.sponsor,
        "targeting" -> lineItem.targeting
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

  private implicit val sponsorshipReportWrites = new Writes[SponsorshipReport] {
    def writes(sponsorshipReport: SponsorshipReport): JsValue = {
      Json.obj(
        "updatedTimeStamp" -> sponsorshipReport.updatedTimeStamp,
        "sponsorships" -> sponsorshipReport.sponsorships
      )
    }
  }

  private implicit val pageSkinSponsorshipWrites = new Writes[PageSkinSponsorship] {
    def writes(sponsorship: PageSkinSponsorship): JsValue = {
      Json.obj(
        "lineItem" -> sponsorship.lineItemName,
        "lineItemId" -> sponsorship.lineItemId,
        "adUnits" -> sponsorship.adUnits,
        "countries" -> sponsorship.countries
      )
    }
  }

  private implicit val pageSkinSponsorshipReportWrites = new Writes[PageSkinSponsorshipReport] {
    def writes(report: PageSkinSponsorshipReport): JsValue = {
      Json.obj(
        "updatedTimeStamp" -> report.updatedTimeStamp,
        "sponsorships" -> report.sponsorships
      )
    }
  }

  def run() {
    future {
      val data = DfpDataExtractor(DfpDataHydrator.loadCurrentLineItems())

      if (data.isValid) {
        val now = DateTime.now().toHttpDateTimeString

        val sponsorships = data.sponsorships
        Store.putDfpSponsoredTags(stringify(toJson(SponsorshipReport(now, sponsorships))))

        val advertisementFeatureSponsorships = data.advertisementFeatureSponsorships
        Store.putDfpAdvertisementFeatureTags(stringify(toJson(SponsorshipReport(now, advertisementFeatureSponsorships))))

        val pageSkinSponsorships = data.pageSkinSponsorships
        Store.putDfpPageSkinAdUnits(stringify(toJson(PageSkinSponsorshipReport(now, pageSkinSponsorships))))

        Store.putDfpLineItemsReport(stringify(toJson(data.lineItems)))
      }
    }
  }
}
