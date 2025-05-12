package dfp

import common.dfp._
import common.GuLogging
import org.joda.time.DateTime
import play.api.libs.json.Json.{toJson, _}
import tools.Store
import conf.switches.Switches.{LineItemJobs}

import scala.concurrent.{ExecutionContext, Future}

class DfpDataCacheJob(
    adUnitAgent: AdUnitAgent,
    customFieldAgent: CustomFieldAgent,
    customTargetingAgent: CustomTargetingAgent,
    placementAgent: PlacementAgent,
    dfpApi: DfpApi,
) extends GuLogging {

  case class LineItemLoadSummary(validLineItems: Seq[GuLineItem], invalidLineItems: Seq[GuLineItem])

  def run()(implicit executionContext: ExecutionContext): Future[Unit] =
    Future {
      log.info("Refreshing data cache")
      val start = System.currentTimeMillis
      val data = loadLineItems()
      val sponsorshipLineItemIds = dfpApi.readSponsorshipLineItemIds()
      val currentLineItems = loadCurrentLineItems()
      val duration = System.currentTimeMillis - start
      log.info(s"Loading DFP data took $duration ms")
      write(data)
      if (LineItemJobs.isSwitchedOff) Store.putNonRefreshableLineItemIds(sponsorshipLineItemIds)
      writeLiveBlogTopSponsorships(currentLineItems)
      writeSurveySponsorships(currentLineItems)
    }

  /*
  for initialization and total refresh of data,
  so would be used for first read and for emergency data update.
   */
  def refreshAllDfpData()(implicit executionContext: ExecutionContext): Unit = {

    for {
      _ <- adUnitAgent.refresh()
      _ <- customFieldAgent.refresh()
      _ <- customTargetingAgent.refresh()
      _ <- placementAgent.refresh()
    } {
      loadLineItems()
    }
  }

  private def loadCurrentLineItems(): DfpDataExtractor = {
    val currentLineItems = dfpApi.readCurrentLineItems

    val loadSummary = LineItemLoadSummary(
      validLineItems = currentLineItems.validItems,
      invalidLineItems = currentLineItems.invalidItems,
    )

    DfpDataExtractor(loadSummary.validLineItems, loadSummary.invalidLineItems)
  }

  private def loadLineItems(): DfpDataExtractor = {

    def fetchCachedLineItems(): DfpLineItems = {
      val lineItemReport = Store.getDfpLineItemsReport()

      DfpLineItems(validItems = lineItemReport.lineItems, invalidItems = lineItemReport.invalidLineItems)
    }

    val start = System.currentTimeMillis

    val loadSummary = loadLineItems(
      fetchCachedLineItems(),
      dfpApi.readLineItemsModifiedSince,
      dfpApi.readCurrentLineItems,
    )

    val loadDuration = System.currentTimeMillis - start
    log.info(s"Loading line items took $loadDuration ms")

    DfpDataExtractor(loadSummary.validLineItems, loadSummary.invalidLineItems)
  }

  def report(ids: Iterable[Long]): String = if (ids.isEmpty) "None" else ids.mkString(", ")

  def loadLineItems(
      cachedLineItems: => DfpLineItems,
      lineItemsModifiedSince: DateTime => DfpLineItems,
      allActiveLineItems: => DfpLineItems,
  ): LineItemLoadSummary = {

    // If the cache is empty, run a full query to generate a complete LineItemLoadSummary, using allActiveLineItems.
    if (cachedLineItems.validItems.isEmpty) {
      // Create a full summary object from scratch, using a query that collects all line items from dfp.
      LineItemLoadSummary(
        validLineItems = allActiveLineItems.validItems,
        invalidLineItems = allActiveLineItems.invalidItems,
      )
    } else {

      // Calculate the most recent modified timestamp of the existing cache items,
      // and find line items modified since that timestamp.
      val threshold = cachedLineItems.validItems.map(_.lastModified).maxBy(_.getMillis)
      val recentlyModified = lineItemsModifiedSince(threshold)

      // Update existing items with a patch of new items.
      def updateCachedContent(existingItems: Seq[GuLineItem], newItems: Seq[GuLineItem]): Seq[GuLineItem] = {

        // Create a combined map of all the line items, preferring newer items over old ones (equality is based on id).
        val updatedLineItemMap = GuLineItem.asMap(existingItems) ++ GuLineItem.asMap(newItems)

        // These are the existing, cached keys.
        val existingKeys = existingItems.map(_.id).toSet

        val (active, inactive) = newItems partition (Seq("READY", "DELIVERING", "DELIVERY_EXTENDED") contains _.status)
        val activeKeys = active.map(_.id).toSet
        val inactiveKeys = inactive.map(_.id).toSet

        val added = activeKeys -- existingKeys
        val modified = activeKeys intersect existingKeys
        val removed = inactiveKeys intersect existingKeys

        // New cache contents.
        val updatedKeys = existingKeys ++ added -- removed

        log.info(s"Cached line item count was ${cachedLineItems.validItems.size}")
        log.info(s"Last modified time of cached line items: $threshold")

        log.info(s"Added: ${report(added)}")
        log.info(s"Modified: ${report(modified)}")
        log.info(s"Removed: ${report(inactiveKeys)}")
        log.info(s"Cached line item count now ${updatedKeys.size}")

        updatedKeys.toSeq.sorted.map(updatedLineItemMap)
      }

      LineItemLoadSummary(
        validLineItems = updateCachedContent(cachedLineItems.validItems, recentlyModified.validItems),
        invalidLineItems = updateCachedContent(cachedLineItems.invalidItems, recentlyModified.invalidItems),
      )
    }
  }

  private def write(data: DfpDataExtractor): Unit = {

    if (data.hasValidLineItems && LineItemJobs.isSwitchedOff) {
      val now = printLondonTime(DateTime.now())

      val pageSkinSponsorships = data.pageSkinSponsorships
      Store.putDfpPageSkinAdUnits(stringify(toJson(PageSkinSponsorshipReport(now, pageSkinSponsorships))))
      Store.putDfpLineItemsReport(stringify(toJson(LineItemReport(now, data.lineItems, data.invalidLineItems))))
    }
  }

  private def writeLiveBlogTopSponsorships(data: DfpDataExtractor): Unit = {
    if (data.hasValidLineItems) {
      val now = printLondonTime(DateTime.now())

      val sponsorships = data.liveBlogTopSponsorships
      Store.putLiveBlogTopSponsorships(
        stringify(toJson(LiveBlogTopSponsorshipReport(Some(now), sponsorships))),
      )
    }
  }

  private def writeSurveySponsorships(data: DfpDataExtractor): Unit = {
    if (data.hasValidLineItems) {
      val now = printLondonTime(DateTime.now())

      val sponsorships = data.surveySponsorships
      Store.putSurveySponsorships(
        stringify(toJson(SurveySponsorshipReport(Some(now), sponsorships))),
      )
    }
  }

}
