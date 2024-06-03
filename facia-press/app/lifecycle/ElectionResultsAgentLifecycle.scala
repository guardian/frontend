package lifecycle

import app.LifecycleComponent
import common.{GuLogging, JobScheduler, PekkoAsync}
import play.api.inject.ApplicationLifecycle
import services.ElectionResultsAgent

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContext, Future}

class ElectionResultsAgentLifecycle(
    applicationLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    electionResultsAgent: ElectionResultsAgent,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent
    with GuLogging {

  applicationLifecycle.addStopHook { () =>
    Future {
      descheduleJobs()
    }
  }

  override def start(): Unit = {
    descheduleJobs()
    scheduleJobs()

    pekkoAsync.after1s {
      electionResultsAgent.refresh()
    }
  }

  private def scheduleJobs(): Unit = {
    // This job runs every 2 minutes
    jobs.scheduleEvery("ElectionResultsJob", 2.minutes) {
      electionResultsAgent.refresh()
    }
  }

  private def descheduleJobs(): Unit = {
    jobs.deschedule("ElectionResultsJob")
  }
}
