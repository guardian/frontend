package lifecycle

import common.LifecycleComponent
import conf.Configuration
import frontpress.{FrontPressCron, ToolPressQueueWorker}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class FaciaPressLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    ToolPressQueueWorker.stop()
  }}

  override def start(): Unit = {
    ToolPressQueueWorker.start()
    if (Configuration.faciatool.frontPressCronQueue.isDefined) {
      FrontPressCron.start()
    }
  }
}
