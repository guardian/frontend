package feed

import common.Jobs
import play.api.{ Application => PlayApp, Play, GlobalSettings }
import play.api.Play.current

trait OnwardJourneyLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("OnwardJourneyAgentsRefreshJob")

    // fire every min
    Jobs.schedule("OnwardJourneyAgentsRefreshJob",  "0 * * * * ?") {
      LatestContentAgent.update()
      MostPopularAgent.refresh()
      MostPopularExpandableAgent.refresh()
      GeoMostPopularAgent.refresh()
    }

    if (Play.isDev) {
      LatestContentAgent.update()
      MostPopularAgent.refresh()
      MostPopularExpandableAgent.refresh()
      GeoMostPopularAgent.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("OnwardJourneyAgentsRefreshJob")

    LatestContentAgent.stop()
    MostPopularAgent.stop()
    MostPopularExpandableAgent.stop()
    GeoMostPopularAgent.stop()

    super.onStop(app)
  }
}
