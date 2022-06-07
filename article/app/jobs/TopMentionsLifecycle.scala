package jobs

import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle
import topmentions.TopMentionsService

import scala.concurrent.{ExecutionContext, Future}

class TopMentionsLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    topMentionService: TopMentionsService,
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
      topMentionService.refreshTopMentions()
    }
  }

  private def scheduleJobs(): Unit = {
    jobs.schedule("TopMentionsAgentRefreshJob", "0 0/2 * * * ?") {
      topMentionService.refreshTopMentions()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("TopMentionsAgentRefreshJob")
  }
}
