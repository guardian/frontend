package dfp

import common.dfp.GuAdUnit
import common.{AkkaAsync, ExecutionContexts, Jobs}
import play.api.{Application, GlobalSettings}

import scala.concurrent.Future

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
      val interval: Int = 2
      def run(): Future[Unit] = DfpDataCacheJob.run()
    },

    new Job[Unit] {
      val name: String = "DFP-Ad-Units-Update"
      val interval: Int = 60
      def run(): Future[Unit] = DfpAdUnitCacheJob.run()
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
      DfpDataCacheJob.refreshAllDfpData()
    }
  }

  override def onStop(app: Application) {
    jobs foreach { job =>
      Jobs.deschedule(job.name)
    }
    super.onStop(app)
  }
}
