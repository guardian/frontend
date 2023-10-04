package jobs

import app.LifecycleComponent
import common.{PekkoAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle
import services.MessageUsService

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class MessageUsLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    messageUsService: MessageUsService,
)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

  appLifeCycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    // refresh message us data when app starts
    pekkoAsync.after1s {
      messageUsService.refreshMessageUsData()
    }
  }

  private def scheduleJobs(): Unit = {
    // This job runs every 8 minutes
    jobs.scheduleEvery("MessageUsAgentRefreshJob", 8.minutes) {
      messageUsService.refreshMessageUsData()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("MessageUsAgentRefreshJob")
  }
}
