package feed

import agents.DeeplyReadAgent
import app.LifecycleComponent
import common.{PekkoAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle

import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.ExecutionContextExecutorService

class DeeplyReadLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    deeplyReadAgent: DeeplyReadAgent,
) extends LifecycleComponent {

  implicit val executionContext: ExecutionContextExecutorService =
    ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

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
