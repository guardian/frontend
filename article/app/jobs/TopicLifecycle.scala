package jobs

import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle
import topics.TopicService

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class TopicLifecycle(
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
      topicService.refreshTopics()
    }
  }

  private def scheduleJobs(): Unit = {
    // This job runs every 2 minutes
    jobs.scheduleEvery("TopMentionsAgentRefreshJob", 2.minutes) {
      topicService.refreshTopics()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("TopMentionsAgentRefreshJob")
  }
}
