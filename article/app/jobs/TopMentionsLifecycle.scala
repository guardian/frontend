package jobs

import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle
import topmentions.TopicService

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class TopMentionsLifecycle(
    appLifeCycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    topicService: TopicService,
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
      topicService.refreshTopicsDetails()
    }
  }

  private def scheduleJobs(): Unit = {
    // This job runs every 2 minutes
    jobs.scheduleEvery("BlogsTopicsDetailsAgentRefreshJob", 2.minutes) {
      topicService.refreshTopicsDetails()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("BlogsTopicsDetailsAgentRefreshJob")
  }
}
