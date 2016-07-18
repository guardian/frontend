package business

import app.LifecycleComponent
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class StocksDataLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    StocksData.stop()
  }}

  def start(): Unit = {
    StocksData.start()
  }
}
