package feed

import agents.DeeplyReadAgent
import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle

import java.util.concurrent.Executors
import scala.concurrent.{ExecutionContext, Future}

class DeeplyReadLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    deeplyReadAgent: DeeplyReadAgent,
) extends LifecycleComponent {

  implicit val executionContext = ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

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

    akkaAsync.after1s {
      deeplyReadAgent.refresh()
    }
  }
}
