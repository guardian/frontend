package commercial

import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import play.api.inject.ApplicationLifecycle
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._

class AdmiralLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    ws: WSClient,
    admiralApi: AdmiralApi,
)(implicit ec: ExecutionContext)
    extends LifecycleComponent {

  appLifecycle.addStopHook { () =>
    Future {
      jobs.deschedule("AdmiralAgentRefreshJob")
    }
  }

  override def start(): Unit = {
    jobs.deschedule("AdmiralAgentRefreshJob")

    jobs.scheduleEvery("AdmiralAgentRefreshJob", 1.hour) {
      AdmiralAgent.refresh(ws = ws, admiralApi = admiralApi)
    }

    pekkoAsync.after1s {
      AdmiralAgent.refresh(ws = ws, admiralApi = admiralApi)
    }
  }
}
