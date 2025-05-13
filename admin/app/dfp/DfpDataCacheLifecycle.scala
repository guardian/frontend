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
    customFieldAgent: CustomFieldAgent,
    customTargetingAgent: CustomTargetingAgent,
    customTargetingKeyValueJob: CustomTargetingKeyValueJob,
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
    // used for line items and custom fields admin page
    new Job[DataCache[String, GuCustomField]] {
      val name = "DFP-CustomFields-Update"
      val interval = 30
      def run() = customFieldAgent.refresh()
    },
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
    // used for line items and creative templates admin page
    new Job[Seq[GuCreativeTemplate]] {
      val name: String = "DFP-Creative-Templates-Update"
      val interval: Int = 15
      def run() = creativeTemplateAgent.refresh()
    },
    // used for creative templates admin page
    new Job[Unit] {
      val name: String = "DFP-Template-Creatives-Cache"
      val interval: Int = 2
      def run() = dfpTemplateCreativeCacheJob.run()
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
      creativeTemplateAgent.refresh()
      dfpTemplateCreativeCacheJob.run()
      customTargetingKeyValueJob.run()
      customFieldAgent.refresh()
    }
  }
}
