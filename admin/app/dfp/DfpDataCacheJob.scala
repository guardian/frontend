package dfp

import common.dfp.GuCreativeTemplate.{lastModified, merge}
import common.dfp._
import common.{ExecutionContexts, Logging}
import conf.switches.Switches
import conf.switches.Switches.DfpCachingSwitch
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.libs.json.Json.{toJson, _}
import tools.Store

import scala.concurrent.Future

object DfpDataCacheJob extends ExecutionContexts with Logging {

  case class LineItemLoadSummary(prevCount: Int,
                                 loadThreshold: Option[DateTime],
                                 current: Seq[GuLineItem],
                                 recentlyAddedIds: Iterable[Long],
                                 recentlyModifiedIds: Iterable[Long],
                                 recentlyRemovedIds: Iterable[Long])

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
    val hydrator = DfpDataHydrator()

    def fetchCachedLineItems(): Seq[GuLineItem] = {
      val maybeLineItems = for {
        json <- Store.getDfpLineItemsReport()
        lineItemReport <- Json.parse(json).asOpt[LineItemReport]
      } yield lineItemReport.lineItems
      maybeLineItems getOrElse Nil
    }

    val start = System.currentTimeMillis

    def logReport(loadSummary: LineItemLoadSummary): Unit = {
      def report(ids: Iterable[Long]): String = if (ids.isEmpty) "None" else ids.mkString(", ")
      log.info(s"Cached line item count was ${loadSummary.prevCount}")
      for (threshold <- loadSummary.loadThreshold) {
        log.info(s"Last modified time of cached line items: $threshold")
      }
      log.info(s"Added: ${report(loadSummary.recentlyAddedIds)}")
      log.info(s"Modified: ${report(loadSummary.recentlyModifiedIds)}")
      log.info(s"Removed: ${report(loadSummary.recentlyRemovedIds)}")
      log.info(s"Cached line item count now ${loadSummary.current.size}")
    }

    val lineItems = {
      if (Switches.DfpCacheRecentOnly.isSwitchedOn) {
        val loadSummary = loadLineItems(
          fetchCachedLineItems(),
          hydrator.loadLineItemsModifiedSince,
          hydrator.loadCurrentLineItems()
        )
        logReport(loadSummary)
        loadSummary.current
      } else hydrator.loadCurrentLineItems()
    }

    val loadDuration = System.currentTimeMillis - start
    log.info(s"Loading line items took $loadDuration ms")

    DfpDataExtractor(lineItems)
  }

  def loadLineItems(cachedLineItems: => Seq[GuLineItem],
                    lineItemsModifiedSince: DateTime => Seq[GuLineItem],
                    allReadyOrDeliveringLineItems: => Seq[GuLineItem]): LineItemLoadSummary = {

    def summarizeNewCache: LineItemLoadSummary = LineItemLoadSummary(
      prevCount = 0,
      loadThreshold = None,
      current = allReadyOrDeliveringLineItems,
      recentlyAddedIds = allReadyOrDeliveringLineItems.map(_.id),
      recentlyModifiedIds = Nil,
      recentlyRemovedIds = Nil
    )

    def summarizeUpdatedCache: LineItemLoadSummary = {
      val threshold = cachedLineItems.map(_.lastModified).maxBy(_.getMillis)
      val recentlyModified = lineItemsModifiedSince(threshold)

      def summarizeUnmodifiedCache: LineItemLoadSummary = LineItemLoadSummary(
          prevCount = cachedLineItems.size,
          loadThreshold = Some(threshold),
          current = cachedLineItems,
          recentlyAddedIds = Nil,
          recentlyModifiedIds = Nil,
          recentlyRemovedIds = Nil
        )

      def summarizeModifiedCache: LineItemLoadSummary = {
        def idToLineItem(lineItems: Seq[GuLineItem]) = lineItems.map(item => item.id -> item).toMap
        val cachedIdToLineItem = idToLineItem(cachedLineItems)
        val (readyOrDeliveringModified, otherModified) =
          recentlyModified partition (Seq("READY", "DELIVERING") contains _.status)
        val readyOrDeliveringIdToLineItem = idToLineItem(readyOrDeliveringModified)
        val otherModifiedIds = otherModified.map(_.id)
        val added = readyOrDeliveringIdToLineItem -- cachedIdToLineItem.keys
        val modified = readyOrDeliveringIdToLineItem filterKeys cachedIdToLineItem.keySet.contains
        val removed = cachedIdToLineItem filterKeys otherModifiedIds.contains
        val lineItems = cachedIdToLineItem ++ added ++ modified -- removed.keys
        LineItemLoadSummary(
          prevCount = cachedLineItems.size,
          loadThreshold = Some(threshold),
          lineItems.values.toSeq.sortBy(_.id),
          recentlyAddedIds = added.keys,
          recentlyModifiedIds = modified.keys,
          recentlyRemovedIds = removed.keys
        )
      }

      if (recentlyModified.isEmpty) {
        summarizeUnmodifiedCache
      } else {
        summarizeModifiedCache
      }
    }

    if (cachedLineItems.isEmpty) {
      summarizeNewCache
    } else {
      summarizeUpdatedCache
    }
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

      Store.putTopAboveNavSlotTakeovers(stringify(toJson(LineItemReport(now,
        data.topAboveNavSlotTakeovers))))
      Store.putTopBelowNavSlotTakeovers(stringify(toJson(LineItemReport(now,
        data.topBelowNavSlotTakeovers))))
      Store.putTopSlotTakeovers(stringify(toJson(LineItemReport(now, data.topSlotTakeovers))))

      if (Switches.DfpCacheCreativeTemplates.isSwitchedOn) {
        log.info("Storing creative template data...")
        val cachedCreativeTemplates = Store.getDfpCreativeTemplates
        val creativeTemplateThreshold = lastModified(cachedCreativeTemplates)
        val recentCreativeTemplates =
          DfpDataHydrator().loadActiveUserDefinedCreativeTemplates(creativeTemplateThreshold)
        val creativeTemplatesToCache = merge(cachedCreativeTemplates, recentCreativeTemplates)
        if (creativeTemplatesToCache != cachedCreativeTemplates) {
          Store.putCreativeTemplates(stringify(toJson(creativeTemplatesToCache)))
          log.info("Stored creative template data")
        } else {
          log.info("No change in creative template data")
        }
      }
    }
  }
}
