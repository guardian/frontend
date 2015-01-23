package dfp

import common.{ExecutionContexts, Logging}
import conf.Switches.DfpCachingSwitch
import org.joda.time.DateTime
import play.api.libs.json.Json.{toJson, _}
import tools.Store

import scala.concurrent.Future

object DfpDataCacheJob extends ExecutionContexts with Logging {

  def run(): Future[Unit] = Future {
    if (DfpCachingSwitch.isSwitchedOn) {
      log.info("Refreshing data cache")
      val start = System.currentTimeMillis
      val data = loadLineItems()
      val duration = System.currentTimeMillis - start
      log.info(s"Loading DFP data took $duration ms")
      write(data)
    }
    else log.info("DFP caching switched off")
  }

  /*
  for initialization and total refresh of data,
  so would be used for first read and for emergency data update.
  */
  def refreshAllDfpData(): Unit = {
    for {
      _ <- AdUnitAgent.refresh()
      _ <- CustomFieldAgent.refresh()
      _ <- CustomTargetingKeyAgent.refresh()
      _ <- CustomTargetingValueAgent.refresh()
      _ <- PlacementAgent.refresh()
    } {
      DfpAdFeatureCacheJob.run()
      val data = loadLineItems()
      val paidForTags = PaidForTag.fromLineItems(data.lineItems)
      CapiLookupAgent.refresh(paidForTags) map {
        _ => write(data)
      }
    }
  }

  private def loadLineItems(): DfpDataExtractor = {
    DfpDataExtractor(DfpDataHydrator().loadCurrentLineItems())
  }

  private def write(data: DfpDataExtractor): Unit = {
    if (data.isValid) {
      val now = printLondonTime(DateTime.now())

      val paidForTags = PaidForTag.fromLineItems(data.lineItems)
      CapiLookupAgent.refresh(paidForTags)
      Store.putDfpPaidForTags(stringify(toJson(PaidForTagsReport(now, paidForTags))))

      val inlineMerchandisingTargetedTags = data.inlineMerchandisingTargetedTags
      Store.putInlineMerchandisingSponsorships(stringify(toJson(
        InlineMerchandisingTargetedTagsReport(now, inlineMerchandisingTargetedTags))))

      val pageSkinSponsorships = data.pageSkinSponsorships
      Store.putDfpPageSkinAdUnits(stringify(toJson(PageSkinSponsorshipReport(now,
        pageSkinSponsorships))))

      Store.putDfpLineItemsReport(stringify(toJson(LineItemReport(now, data.lineItems))))
    }
  }

}
