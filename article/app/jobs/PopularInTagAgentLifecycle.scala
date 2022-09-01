package jobs

import agents.PopularInTagAgent
import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class PopularInTagAgentLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync,
  popularInTagAgent: PopularInTagAgent,
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
      popularInTagAgent.refresh()
    }
  }

  private def scheduleJobs(): Unit = {
    // TODO: what schedule do we want this to run on?
    jobs.scheduleEvery("PopularInTagJob", 5.minutes) {
      popularInTagAgent.refresh()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("PopularInTagJob")
  }

}
