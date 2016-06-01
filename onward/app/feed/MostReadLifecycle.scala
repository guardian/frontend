package feed

import common.{LifecycleComponent, AkkaAsync, Jobs}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class MostReadLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    Jobs.deschedule("MostReadAgentRefreshJob")
  }}

  override def start(): Unit = {
    Jobs.deschedule("MostReadAgentRefreshJob")

    // update every 30 min
    Jobs.schedule("MostReadAgentRefreshJob",  "0 0/30 * * * ?") {
      MostReadAgent.update()
    }

    AkkaAsync {
      MostReadAgent.update()
    }
  }
}
