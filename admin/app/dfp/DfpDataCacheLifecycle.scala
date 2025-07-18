package dfp

import app.LifecycleComponent
import common.dfp.{GuAdUnit, GuCreativeTemplate, GuCustomTargeting}
import common._
import play.api.inject.ApplicationLifecycle
import conf.switches.Switches.{LineItemJobs}

import scala.concurrent.{ExecutionContext, Future}

class DfpDataCacheLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobScheduler: JobScheduler,
    customTargetingAgent: CustomTargetingAgent,
    customTargetingKeyValueJob: CustomTargetingKeyValueJob,
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
    // used for line items and custom targeting admin page
    new Job[DataCache[Long, GuCustomTargeting]] {
      val name = "DFP-CustomTargeting-Update"
      val interval = 30
      def run() = customTargetingAgent.refresh()
    },
    // used for custom targeting admin page
    new Job[Unit] {
      val name: String = "DFP-CustomTargeting-Store"
      val interval: Int = 15
      def run() = customTargetingKeyValueJob.run()
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
      customTargetingKeyValueJob.run()
    }
  }
}
