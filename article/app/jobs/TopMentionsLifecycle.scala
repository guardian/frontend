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
  }

  private def scheduleJobs(): Unit = {
    val cron = "0 0/1 * * * ?"
    jobs.schedule("TopMentionsAgentRefreshJob", "0/30 * * * * ? *") {
      topMentionService.refreshTopMentions()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("TopMentionsAgentRefreshJob")
  }
}
