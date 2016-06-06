package crosswords

import common.LifecycleComponent
import play.api.inject.ApplicationLifecycle
import play.api.{Play, Mode}

import scala.concurrent.{Future, ExecutionContext}

class TodaysCrosswordGridLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    TodaysCrosswordGrid.stop()
  }}

  override def start(): Unit = {
    if(Play.current.mode != Mode.Test) {
      TodaysCrosswordGrid.start()
    }
  }
}
