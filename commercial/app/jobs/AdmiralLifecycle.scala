package jobs

import agents.AdmiralAgent
import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

class AdmiralLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    admiralAgent: AdmiralAgent,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("AdmiralAgentRefreshJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("AdmiralAgentRefreshJob")

    jobs.scheduleEvery("AdmiralAgentRefreshJob", 2.hours) {
      admiralAgent.refresh()
    }

    pekkoAsync.after1s {
      admiralAgent.refresh()
    }
  }
}
