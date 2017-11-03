package dfp

import common.dfp._
import common.Logging
import org.joda.time.DateTime
import play.api.libs.json.Json.{toJson, _}
import tools.Store

import scala.concurrent.{ExecutionContext, Future}

class DfpDataCacheJob(adUnitAgent: AdUnitAgent,
                      customFieldAgent: CustomFieldAgent,
                      customTargetingAgent: CustomTargetingAgent,
                      placementAgent: PlacementAgent,
                      dfpApi: DfpApi) extends Logging {

  case class LineItemLoadSummary(
    validLineItems: Seq[GuLineItem],
    invalidLineItems: Seq[GuLineItem])

  def run()(implicit executionContext: ExecutionContext): Future[Unit] = Future {
    log.info("Refreshing data cache")
    val start = System.currentTimeMillis
    val data = loadLineItems()
    val duration = System.currentTimeMillis - start
    log.info(s"Loading DFP data took $duration ms")
    write(data)
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

  private def loadLineItems(): DfpDataExtractor = {

    def fetchCachedLineItems(): DfpLineItems = {
      val lineItemReport = Store.getDfpLineItemsReport()

      DfpLineItems(
        validItems = lineItemReport.lineItems,
        invalidItems = lineItemReport.invalidLineItems)
    }

    val start = System.currentTimeMillis

    val loadSummary = loadLineItems(
      fetchCachedLineItems(),
      dfpApi.readLineItemsModifiedSince,
      dfpApi.readCurrentLineItems
    )

    val loadDuration = System.currentTimeMillis - start
    log.info(s"Loading line items took $loadDuration ms")

    DfpDataExtractor(loadSummary.validLineItems, loadSummary.invalidLineItems)
  }

  def report(ids: Iterable[Long]): String = if (ids.isEmpty) "None" else ids.mkString(", ")

  def loadLineItems(cachedLineItems: => DfpLineItems,
                    lineItemsModifiedSince: DateTime => DfpLineItems,
                    allActiveLineItems: => DfpLineItems): LineItemLoadSummary = {

    // If the cache is empty, run a full query to generate a complete LineItemLoadSummary, using allActiveLineItems.
    if (cachedLineItems.validItems.isEmpty) {
      // Create a full summary object from scratch, using a query that collects all line items from dfp.
      LineItemLoadSummary(
        validLineItems = allActiveLineItems.validItems,
        invalidLineItems = allActiveLineItems.invalidItems
      )
    } else {

      // Calculate the most recent modified timestamp of the existing cache items,
      // and find line items modified since that timestamp.
      val threshold = cachedLineItems.validItems.map(_.lastModified).maxBy(_.getMillis)
      val recentlyModified = lineItemsModifiedSince(threshold)

      // Update existing items with a patch of new items.
      def updateCachedContent(existingItems: Seq[GuLineItem], newItems: Seq[GuLineItem], logging: Boolean = true): Seq[GuLineItem] = {

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
        invalidLineItems = updateCachedContent(cachedLineItems.invalidItems, recentlyModified.invalidItems, logging = false)
      )
    }
  }

  private def write(data: DfpDataExtractor): Unit = {

    if (data.hasValidLineItems) {
      val now = printLondonTime(DateTime.now())

      val inlineMerchandisingTargetedTags = data.inlineMerchandisingTargetedTags
      Store.putInlineMerchandisingSponsorships(stringify(toJson(
        InlineMerchandisingTargetedTagsReport(now, inlineMerchandisingTargetedTags))))

      val targetedHighMerchandisingLineItems = data.targetedHighMerchandisingLineItems
      Store.putHighMerchandisingSponsorships(stringify(toJson(
        HighMerchandisingTargetedTagsReport(now, targetedHighMerchandisingLineItems))))

      val pageSkinSponsorships = data.pageSkinSponsorships
      Store.putDfpPageSkinAdUnits(stringify(toJson(PageSkinSponsorshipReport(now,
        pageSkinSponsorships))))

      Store.putDfpLineItemsReport(stringify(toJson(LineItemReport(now, data.lineItems, data.invalidLineItems))))

      Store.putTopAboveNavSlotTakeovers(stringify(toJson(LineItemReport(now,
        data.topAboveNavSlotTakeovers, Seq.empty))))
    }
  }
}
