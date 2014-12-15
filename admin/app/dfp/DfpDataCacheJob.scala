package dfp

import common.{ExecutionContexts, Logging}
import conf.Switches.{DfpCachingSwitch, DfpMemoryLeakSwitch}
import org.joda.time.DateTime
import play.api.libs.json.Json.{toJson, _}
import tools.Store

import scala.concurrent.{Future, future}

object DfpDataCacheJob extends ExecutionContexts with Logging {

  def run(): Future[Unit] = future {
    if (DfpCachingSwitch.isSwitchedOn) cacheData()
  }

  def cacheData(): Unit = {

    def write(data: DfpDataExtractor): Unit = {
      val now = printLondonTime(DateTime.now())

      val sponsorships = data.sponsorships
      Store.putDfpSponsoredTags(stringify(toJson(SponsorshipReport(now, sponsorships))))

      val advertisementFeatureSponsorships = data.advertisementFeatureSponsorships
      Store.putDfpAdvertisementFeatureTags(stringify(toJson(SponsorshipReport(now,
        advertisementFeatureSponsorships))))

      val inlineMerchandisingTargetedTags = data.inlineMerchandisingTargetedTags
      Store.putInlineMerchandisingSponsorships(stringify(toJson(
        InlineMerchandisingTargetedTagsReport(now, inlineMerchandisingTargetedTags))))

      val foundationSupported = data.foundationSupported
      Store.putDfpFoundationSupportedTags(stringify(toJson(SponsorshipReport(now,
        foundationSupported))))

      val pageSkinSponsorships = data.pageSkinSponsorships
      Store.putDfpPageSkinAdUnits(stringify(toJson(PageSkinSponsorshipReport(now,
        pageSkinSponsorships))))

      Store.putDfpLineItemsReport(stringify(toJson(LineItemReport(now, data.lineItems))))
    }

    log.info("Refreshing data cache")
    val start = System.currentTimeMillis
    val data = DfpDataExtractor(DfpDataHydrator().loadCurrentLineItems())
    val duration = System.currentTimeMillis - start
    log.info(s"Loading DFP data took $duration ms")

    if (DfpMemoryLeakSwitch.isSwitchedOn) MemoryLeakPlug()

    if (data.isValid) write(data)
  }

}



