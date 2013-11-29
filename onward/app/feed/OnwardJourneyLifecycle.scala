package feed

import common.Jobs
import play.api.{ Application => PlayApp, Play, GlobalSettings }
import play.api.Play.current

trait OnwardJourneyLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("OnwardJourneyAgentRefreshJob")

    // fire every min
    Jobs.schedule("OnwardJourneyAgentRefreshJob",  "0 * * * * ?") {
      OnwardJourneyAgent.update()
      LatestContentAgent.update()
    }

    if (Play.isDev) {
      OnwardJourneyAgent.update()
      LatestContentAgent.update()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("OnwardJourneyAgentRefreshJob")

    OnwardJourneyAgent.stop()
    LatestContentAgent.stop()

    super.onStop(app)
  }
}
