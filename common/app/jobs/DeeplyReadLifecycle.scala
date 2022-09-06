package jobs

import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}
import agents.DeeplyReadAgent
import common.Edition

class DeeplyReadLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    deeplyReadAgent: DeeplyReadAgent,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifeCycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }
  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    // refresh top mentions when app starts
    akkaAsync.after1s {
      Edition.all.foreach { edition =>
        deeplyReadAgent.refresh(edition)
      }
      Future.successful(())
    }
  }

  private def scheduleJobs(): Unit = {
    // This job runs every 2 minutes
    jobs.scheduleEvery("DeeplyReadAgentRefreshJob", 2.minutes) {
      Edition.all.foreach { edition =>
        deeplyReadAgent.refresh(edition)
      }
      Future.successful(())
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("DeeplyReadAgentRefreshJob")
  }
}
