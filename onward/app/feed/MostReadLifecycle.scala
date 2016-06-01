package feed

import common.{AkkaAsync, Jobs}
import play.api.{ Application => PlayApp, GlobalSettings }

trait MostReadLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("MostReadAgentRefreshJob")

    // update every 30 min
    Jobs.schedule("MostReadAgentRefreshJob",  "0 0/30 * * * ?") {
      MostReadAgent.update()
    }

    AkkaAsync {
      MostReadAgent.update()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("MostReadAgentRefreshJob")
    super.onStop(app)
  }
}