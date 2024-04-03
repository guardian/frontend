package feed

import agents.DeeplyReadAgent
import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import play.api.inject.ApplicationLifecycle

import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, ExecutionContextExecutorService, Future}
import common.GuLogging

class DeeplyReadLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    deeplyReadAgent: DeeplyReadAgent,
) extends LifecycleComponent
    with GuLogging {

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
      deeplyReadAgent.refresh().recover {
        case e => log.error(s"Failed to refresh with, ${e.getMessage()}")
      }

    }

    pekkoAsync.after1s {
      deeplyReadAgent.refresh()
    }
  }
}
