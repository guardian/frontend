package lifecycle

import app.LifecycleComponent
import conf.Configuration
import frontpress.{FrontPressCron, ToolPressQueueWorker}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class FaciaPressLifecycle(
    appLifecycle: ApplicationLifecycle,
    frontPressCron: FrontPressCron,
    toolPressQueueWorker: ToolPressQueueWorker,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      toolPressQueueWorker.stop()
    }
  }

  override def start(): Unit = {
    toolPressQueueWorker.start()
    if (Configuration.faciatool.frontPressCronQueue.isDefined) {
      frontPressCron.start()
    }
  }
}
