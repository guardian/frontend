package dfp

import app.LifecycleComponent
import common.dfp.{GuAdUnit, GuCreativeTemplate, GuCustomField, GuCustomTargeting}
import common._
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class DfpDataCacheLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobScheduler: JobScheduler,
    creativeTemplateAgent: CreativeTemplateAgent,
    adUnitAgent: AdUnitAgent,
    advertiserAgent: AdvertiserAgent,
    customFieldAgent: CustomFieldAgent,
    orderAgent: OrderAgent,
    placementAgent: PlacementAgent,
    customTargetingAgent: CustomTargetingAgent,
    dfpDataCacheJob: DfpDataCacheJob,
    dfpAdUnitCacheJob: DfpAdUnitCacheJob,
    dfpMobileAppAdUnitCacheJob: DfpMobileAppAdUnitCacheJob,
    dfpFacebookIaAdUnitCacheJob: DfpFacebookIaAdUnitCacheJob,
    dfpTemplateCreativeCacheJob: DfpTemplateCreativeCacheJob,
    pekkoAsync: PekkoAsync,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs foreach { job =>
        jobScheduler.deschedule(job.name)
      }
    }
  }

  trait Job[T] {
    val name: String
    val interval: Int
    def run(): Future[T]
  }

  val jobs = Set(
    new Job[DataCache[String, GuAdUnit]] {
      val name = "DFP-AdUnits-Update"
      val interval = 30
      def run() = adUnitAgent.refresh()
    },
    new Job[DataCache[String, GuCustomField]] {
      val name = "DFP-CustomFields-Update"
      val interval = 30
      def run() = customFieldAgent.refresh()
    },
    new Job[DataCache[Long, GuCustomTargeting]] {
      val name = "DFP-CustomTargeting-Update"
      val interval = 30
      def run() = customTargetingAgent.refresh()
    },
    new Job[DataCache[Long, Seq[String]]] {
      val name = "DFP-Placements-Update"
      val interval = 30
      def run() = placementAgent.refresh()
    },
    new Job[Unit] {
      val name: String = "DFP-Cache"
      val interval: Int = 2
      def run(): Future[Unit] = dfpDataCacheJob.run()
    },
    new Job[Unit] {
      val name: String = "DFP-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = dfpAdUnitCacheJob.run(pekkoAsync)
    },
    new Job[Unit] {
      val name: String = "DFP-Mobile-Apps-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = dfpMobileAppAdUnitCacheJob.run(pekkoAsync)
    },
    new Job[Unit] {
      val name: String = "DFP-Facebook-IA-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = dfpFacebookIaAdUnitCacheJob.run(pekkoAsync)
    },
    new Job[Seq[GuCreativeTemplate]] {
      val name: String = "DFP-Creative-Templates-Update"
      val interval: Int = 15
      def run() = creativeTemplateAgent.refresh()
    },
    new Job[Unit] {
      val name: String = "DFP-Template-Creatives-Cache"
      val interval: Int = 2
      def run() = dfpTemplateCreativeCacheJob.run()
    },
    new Job[Unit] {
      val name = "DFP-Order-Advertiser-Update"
      val interval: Int = 300
      def run() = {
        Future.sequence(Seq(advertiserAgent.refresh(), orderAgent.refresh())).map(_ => ())
      }
    },
  )

  override def start(): Unit = {
    jobs foreach { job =>
      jobScheduler.deschedule(job.name)
      jobScheduler.scheduleEveryNMinutes(job.name, job.interval) {
        job.run().map(_ => ())
      }
    }

    pekkoAsync.after1s {
      dfpDataCacheJob.refreshAllDfpData()
      creativeTemplateAgent.refresh()
      dfpTemplateCreativeCacheJob.run()
      advertiserAgent.refresh()
      orderAgent.refresh()
      customFieldAgent.refresh()
    }
  }
}
