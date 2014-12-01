package dfp

import common.{Logging, AkkaAsync, Jobs, ExecutionContexts}
import org.joda.time.DateTime
import play.api.{Play, Application, GlobalSettings}
import play.api.libs.json.Json.{toJson, _}
import play.api.libs.json.{JsValue, Json, Writes}
import tools.Store
import conf.Switches.DfpCachingSwitch

import scala.concurrent.future

object DfpDataCacheJob extends ExecutionContexts with Logging {

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

        val start = System.currentTimeMillis
        val data = DfpDataExtractor(DfpDataHydrator().loadCurrentLineItems())
        val duration = System.currentTimeMillis - start
        log.info(s"Reading DFP data took $duration ms")

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

          Store.putDfpLineItemsReport(stringify(toJson(LineItemReport(now, data.lineItems))))
        }
      }
    }
  }
}


trait DfpDataCacheLifecycle extends GlobalSettings {

  val dayTimeJobName = "DayTime-DfpDataCacheJob"
  val nightTimeJobName = "NightTime-DfpDataCacheJob"

  val every10MinsFrom7amTo7pm = "0 2/10 7-18 * * ?"
  val every30MinsFrom7pmTo7am = "0 2/30 19-6 * * ?"
  val dayTimeSchedule = every10MinsFrom7amTo7pm
  val nightTimeSchedule = every30MinsFrom7pmTo7am

  override def onStart(app: Application) {
    super.onStart(app)

    def scheduleJob(jobName: String, schedule: String) {
      Jobs.deschedule(jobName)
      Jobs.schedule(jobName, schedule) {
        DfpDataCacheJob.run()
      }
    }

    if (!Play.isTest(app)) {
      scheduleJob(dayTimeJobName, dayTimeSchedule)
      scheduleJob(nightTimeJobName, nightTimeSchedule)

      AkkaAsync {
        DfpDataCacheJob.run()
      }
    }
  }

  override def onStop(app: Application) {
    if (!Play.isTest(app)) {
      Jobs.deschedule(dayTimeJobName)
      Jobs.deschedule(nightTimeJobName)
    }
    super.onStop(app)
  }
}
