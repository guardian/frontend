package business

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import app.LifecycleComponent
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class StocksDataLifecycle(appLifecycle: ApplicationLifecycle, stocksData: StocksData)(implicit
    ec: ExecutionContext,
    pekkoActorSystem: PekkoActorSystem,
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
