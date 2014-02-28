package feed

import common.Jobs
import play.api.{ Application => PlayApp, Play, GlobalSettings }
import play.api.Play.current

trait MostReadLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("MostReadAgentRefreshJob")

    // update every 30 min
    Jobs.schedule("MostReadAgentRefreshJob",  "0 0/30 * * * ?") {
      MostReadAgent.update()
    }

    if (Play.isDev) {
      MostReadAgent.update()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("MostReadAgentRefreshJob")

    MostReadAgent.stop()

    super.onStop(app)
  }
}
