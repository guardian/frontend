package services.newsletters

import app.LifecycleComponent
import common.JobScheduler
import play.api.inject.ApplicationLifecycle

import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, ExecutionContextExecutorService, Future}

class GroupedNewslettersLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    groupedNewslettersAgent: GroupedNewslettersAgent,
)(implicit
    ec: ExecutionContext,
) extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      descheduleAll()
    }
  }

  private def descheduleAll(): Unit = {
    jobs.deschedule("GroupedNewslettersAgentLowFrequencyRefreshJob")
  }

  override def start(): Unit = {

    descheduleAll()
    groupedNewslettersAgent.refresh()
    jobs.scheduleEveryNMinutes("GroupedNewslettersAgentLowFrequencyRefreshJob", 60) {
      groupedNewslettersAgent.refresh()
    }

  }

}
