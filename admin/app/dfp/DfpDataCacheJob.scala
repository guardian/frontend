package dfp

import common.{AkkaAsync, ExecutionContexts, Jobs, Logging}
import conf.Switches.{DfpCachingSwitch, DfpMemoryLeakSwitch}
import org.joda.time.DateTime
import play.api.libs.json.Json.{toJson, _}
import play.api.{Application, GlobalSettings}
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

    val start = System.currentTimeMillis
    val data = DfpDataExtractor(DfpDataHydrator().loadCurrentLineItems())
    val duration = System.currentTimeMillis - start
    log.info(s"Reading DFP data took $duration ms")

    if (DfpMemoryLeakSwitch.isSwitchedOn) MemoryLeakPlug()

    if (data.isValid) write(data)
  }

}


trait DfpDataCacheLifecycle extends GlobalSettings with ExecutionContexts {

  trait Job[T] {
    val name: String
    val interval: Int
    def run(): Future[T]
  }

  val jobs = Set(

    new Job[DataCache[String, GuAdUnit]] {
      val name = "DFP-AdUnits-Update"
      val interval = 30
      def run() = AdUnitAgent.refresh()
    },

    new Job[DataCache[String, Long]] {
      val name = "DFP-CustomFields-Update"
      val interval = 30
      def run() = CustomFieldAgent.refresh()
    },

    new Job[DataCache[Long, String]] {
      val name = "DFP-TargetingKeys-Update"
      val interval = 30
      def run() = CustomTargetingKeyAgent.refresh()
    },

    new Job[DataCache[Long, String]] {
      val name = "DFP-TargetingValues-Update"
      val interval = 30
      def run() = CustomTargetingValueAgent.refresh()
    },

    new Job[DataCache[Long, Seq[String]]] {
      val name = "DFP-Placements-Update"
      val interval = 30
      def run() = PlacementAgent.refresh()
    },

    new Job[Unit] {
      val name: String = "DFP-Cache"
      val interval: Int = 5
      def run(): Future[Unit] = DfpDataCacheJob.run()
    }

  )

  override def onStart(app: Application) {
    super.onStart(app)

    jobs foreach { job =>
      Jobs.deschedule(job.name)
      Jobs.scheduleEveryNMinutes(job.name, job.interval) {
        job.run()
      }
    }

    AkkaAsync {
      for {
        _ <- AdUnitAgent.refresh()
        _ <- CustomFieldAgent.refresh()
        _ <- CustomTargetingKeyAgent.refresh()
        _ <- CustomTargetingValueAgent.refresh()
        _ <- PlacementAgent.refresh()
      } {
        DfpDataCacheJob.run()
      }
    }
  }

  override def onStop(app: Application) {
    jobs foreach { job =>
      Jobs.deschedule(job.name)
    }
    super.onStop(app)
  }
}
