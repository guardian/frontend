package business

import app.LifecycleComponent
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class StocksDataLifecycle(appLifecycle: ApplicationLifecycle, stocksData: StocksData)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    stocksData.stop()
  }}

  def start(): Unit = {
    stocksData.start()
  }
}
