package dfp

import common.dfp.{GuAdUnit, GuCreativeTemplate}
import common.{LifecycleComponent, AkkaAsync, ExecutionContexts, Jobs}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class DfpDataCacheLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent with ExecutionContexts {

  appLifecycle.addStopHook { () => Future {
    jobs foreach { job =>
      Jobs.deschedule(job.name)
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
      val interval: Int = 2
      def run(): Future[Unit] = DfpDataCacheJob.run()
    },

    new Job[Unit] {
      val name: String = "DFP-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = DfpAdUnitCacheJob.run()
    },

    new Job[Unit] {
      val name: String = "DFP-Mobile-Apps-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = DfpMobileAppAdUnitCacheJob.run()
    },

    new Job[Unit] {
      val name: String = "DFP-Facebook-IA-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = DfpFacebookIaAdUnitCacheJob.run()
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
    }

  )

  override def start() = {
    jobs foreach { job =>
      Jobs.deschedule(job.name)
      Jobs.scheduleEveryNMinutes(job.name, job.interval) {
        job.run().map(_ => ())
      }
    }

    AkkaAsync {
      DfpDataCacheJob.refreshAllDfpData()
      CreativeTemplateAgent.refresh()
      DfpTemplateCreativeCacheJob.run()
    }
  }
}
