package business

import akka.actor.ActorSystem
import app.LifecycleComponent
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class StocksDataLifecycle(appLifecycle: ApplicationLifecycle, stocksData: StocksData)(implicit
    ec: ExecutionContext,
    actorSystem: ActorSystem,
) extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      stocksData.stop()
    }
  }

  def start(): Unit = {
    stocksData.start()
  }
}
