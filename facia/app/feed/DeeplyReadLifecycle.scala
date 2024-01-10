package feed

import agents.DeeplyReadAgent
import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import play.api.inject.ApplicationLifecycle

import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, ExecutionContextExecutorService, Future}

class DeeplyReadLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    deeplyReadAgent: DeeplyReadAgent,
) extends LifecycleComponent {

  implicit val executionContext: ExecutionContextExecutorService = ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

  appLifecycle.addStopHook { () =>
    Future {
      descheduleAll()
    }
  }

  private def descheduleAll(): Unit = {
    jobs.deschedule("DeeplyReadAgentsHighFrequencyRefreshJob")
  }

  override def start(): Unit = {

    descheduleAll()

    jobs.scheduleEveryNMinutes("DeeplyReadAgentsHighFrequencyRefreshJob", 5) {
      deeplyReadAgent.refresh()
    }

    pekkoAsync.after1s {
      deeplyReadAgent.refresh()
    }
  }
}
