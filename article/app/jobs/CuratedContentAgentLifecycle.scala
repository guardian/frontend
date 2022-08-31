package jobs

import agents.CuratedContentAgent
import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class CuratedContentAgentLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    curatedContentAgent: CuratedContentAgent,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    akkaAsync.after1s {
      curatedContentAgent.refresh
    }
  }

  private def scheduleJobs(): Unit = {
    // This job runs every 2 minutes
    jobs.scheduleEvery("CuratedContentJob", 2.minutes) {
      curatedContentAgent.refresh
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("CuratedContentJob")
  }

}
