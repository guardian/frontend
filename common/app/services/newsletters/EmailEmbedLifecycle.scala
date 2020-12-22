package services.newsletters

import app.LifecycleComponent
import common.JobScheduler
import play.api.inject.ApplicationLifecycle

import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, ExecutionContextExecutorService, Future}

class EmailEmbedLifecycle(appLifecycle: ApplicationLifecycle, jobs: JobScheduler, emailEmbedAgent: EmailEmbedAgent)
    extends LifecycleComponent {

  implicit val newsletterClientExecutionContext: ExecutionContextExecutorService =
    ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

  appLifecycle.addStopHook { () =>
    Future {
      descheduleAll()
    }
  }

  private def descheduleAll(): Unit = {
    jobs.deschedule("EmailEmbedAgentLowFrequencyRefreshJob")
  }

  override def start(): Unit = {

    descheduleAll()
    emailEmbedAgent.refresh()
    jobs.scheduleEveryNMinutes("EmailEmbedAgentLowFrequencyRefreshJob", 60) {
      emailEmbedAgent.refresh()
    }

  }

}
