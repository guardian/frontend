package jobs

import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle
import services.MessageUsService

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class MessageUsLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
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
    akkaAsync.after1s {
      messageUsService.refreshMessageUsData()
    }
  }

  private def scheduleJobs(): Unit = {
    // This job runs every 2 minutes
    jobs.scheduleEvery("MessageUsAgentRefreshJob", 2.minutes) {
      messageUsService.refreshMessageUsData()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("MessageUsAgentRefreshJob")
  }
}
