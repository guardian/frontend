package feed

import agents.MostViewedAgent

import java.util.concurrent.Executors
import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class MostViewedLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    mostViewedAgent: MostViewedAgent,
) extends LifecycleComponent {

  implicit val executionContext = ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

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

    akkaAsync.after1s {
      mostViewedAgent.refresh()
    }
  }
}
