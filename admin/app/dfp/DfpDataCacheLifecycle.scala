package dfp

import app.LifecycleComponent
import common.dfp.{GuAdUnit, GuCreativeTemplate, GuCustomField}
import common._
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class DfpDataCacheLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobScheduler: JobScheduler,
  akkaAsync: AkkaAsync)(implicit ec: ExecutionContext) extends LifecycleComponent with ExecutionContexts {

  appLifecycle.addStopHook { () => Future {
    jobs foreach { job =>
      jobScheduler.deschedule(job.name)
    }
  }}

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

    new Job[DataCache[String, GuCustomField]] {
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

    new Job[Unit] {
      val name: String = "DFP-CustomTargeting-Store"
      val interval: Int = 15
      def run() = CustomTargetingKeyValueJob.run()
    },

    new Job[DataCache[Long, Seq[String]]] {
      val name = "DFP-Placements-Update"
      val interval = 30
      def run() = PlacementAgent.refresh()
    },

    new Job[Unit] {
      val name: String = "DFP-Cache"
      val interval: Int = 2
      def run(): Future[Unit] = DfpDataCacheJob.run()
    },

    new Job[Unit] {
      val name: String = "DFP-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = DfpAdUnitCacheJob.run(akkaAsync)
    },

    new Job[Unit] {
      val name: String = "DFP-Mobile-Apps-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = DfpMobileAppAdUnitCacheJob.run(akkaAsync)
    },

    new Job[Unit] {
      val name: String = "DFP-Facebook-IA-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = DfpFacebookIaAdUnitCacheJob.run(akkaAsync)
    },

    new Job[Seq[GuCreativeTemplate]] {
      val name: String = "DFP-Creative-Templates-Update"
      val interval: Int = 15
      def run() = CreativeTemplateAgent.refresh()
    },

    new Job[Unit] {
      val name: String = "DFP-Template-Creatives-Cache"
      val interval: Int = 2
      def run() = DfpTemplateCreativeCacheJob.run()
    },

    new Job[Unit] {
      val name = "DFP-Order-Advertiser-Update"
      val interval: Int = 300
      def run() = {
        Future.sequence(Seq(AdvertiserAgent.refresh(), OrderAgent.refresh())).map(_ => ())
      }
    }
  )

  override def start() = {
    jobs foreach { job =>
      jobScheduler.deschedule(job.name)
      jobScheduler.scheduleEveryNMinutes(job.name, job.interval) {
        job.run().map(_ => ())
      }
    }

    akkaAsync.after1s {
      DfpDataCacheJob.refreshAllDfpData()
      CreativeTemplateAgent.refresh()
      DfpTemplateCreativeCacheJob.run()
      CustomTargetingKeyValueJob.run()
      AdvertiserAgent.refresh()
      OrderAgent.refresh()
      CustomFieldAgent.refresh()
    }
  }
}
