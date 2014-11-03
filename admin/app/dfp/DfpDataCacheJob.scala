package dfp

import common.{AkkaAsync, Jobs, ExecutionContexts}
import org.joda.time.DateTime
import play.api.{Application, GlobalSettings}
import play.api.libs.json.Json.{toJson, _}
import play.api.libs.json.{JsValue, Json, Writes}
import tools.Store
import conf.Switches.DfpCachingSwitch

import scala.concurrent.future

object DfpDataCacheJob extends ExecutionContexts {

  private implicit val pageSkinSponsorshipReportWrites = new Writes[PageSkinSponsorshipReport] {
    def writes(report: PageSkinSponsorshipReport): JsValue = {
      Json.obj(
        "updatedTimeStamp" -> report.updatedTimeStamp,
        "sponsorships" -> report.sponsorships
      )
    }
  }

  private implicit val inlineMerchandisingTagSetWrites = new Writes[InlineMerchandisingTagSet] {
    def writes(tagSet: InlineMerchandisingTagSet): JsValue = {
      Json.obj(
        "keywords" -> tagSet.keywords,
        "series" -> tagSet.series,
        "contributors" -> tagSet.contributors
      )
    }
  }

  private implicit val inlineMerchandisingTargetedTagsReportWrites = new Writes[InlineMerchandisingTargetedTagsReport] {
    def writes(report: InlineMerchandisingTargetedTagsReport): JsValue = {
      Json.obj(
        "updatedTimeStamp" -> report.updatedTimeStamp,
        "targetedTags" -> report.targetedTags
      )
    }
  }

  def run() {
    future {
      if (DfpCachingSwitch.isSwitchedOn) {
        val data = DfpDataExtractor(DfpDataHydrator().loadCurrentLineItems())

        if (data.isValid) {
          val now = printLondonTime(DateTime.now())

          val sponsorships = data.sponsorships
          Store.putDfpSponsoredTags(stringify(toJson(SponsorshipReport(now, sponsorships))))

          val advertisementFeatureSponsorships = data.advertisementFeatureSponsorships
          Store.putDfpAdvertisementFeatureTags(stringify(toJson(SponsorshipReport(now, advertisementFeatureSponsorships))))

          val inlineMerchandisingTargetedTags = data.inlineMerchandisingTargetedTags
          Store.putInlineMerchandisingSponsorships(stringify(toJson(InlineMerchandisingTargetedTagsReport(now, inlineMerchandisingTargetedTags))))

          val foundationSupported = data.foundationSupported
          Store.putDfpFoundationSupportedTags(stringify(toJson(SponsorshipReport(now, foundationSupported))))

          val pageSkinSponsorships = data.pageSkinSponsorships
          Store.putDfpPageSkinAdUnits(stringify(toJson(PageSkinSponsorshipReport(now, pageSkinSponsorships))))

          Store.putDfpLineItemsReport(stringify(toJson(data.lineItems)))
        }
      }
    }
  }
}


trait DfpDataCacheLifecycle extends GlobalSettings {

  private val jobName = "DfpDataCacheJob"
  private val every5Mins = "0 2/5 * * * ?"

  override def onStart(app: Application) {
    super.onStart(app)

    Jobs.deschedule(jobName)
    Jobs.schedule(jobName, every5Mins) {
      DfpDataCacheJob.run()
    }

    AkkaAsync {
      DfpDataCacheJob.run()
    }
  }

  override def onStop(app: Application) {
    Jobs.deschedule(jobName)
    super.onStop(app)
  }
}
