package feed

import agents.MostViewedAgent

import java.util.concurrent.Executors
import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, ExecutionContextExecutorService, Future}

class MostViewedLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    mostViewedAgent: MostViewedAgent,
) extends LifecycleComponent {

  implicit val executionContext: ExecutionContextExecutorService = ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

  appLifecycle.addStopHook { () =>
    Future {
      descheduleAll()
    }
  }

  private def descheduleAll(): Unit = {
    jobs.deschedule("MostViewedAgentsHighFrequencyRefreshJob")
  }

  override def start(): Unit = {

    descheduleAll()

    jobs.scheduleEveryNMinutes("MostViewedAgentsHighFrequencyRefreshJob", 5) {
      mostViewedAgent.refresh()
    }

    pekkoAsync.after1s {
      mostViewedAgent.refresh()
    }
  }
}
