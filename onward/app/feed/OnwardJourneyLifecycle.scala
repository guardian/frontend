package feed

import common.Jobs
import play.api.{ Application => PlayApp, Play, GlobalSettings }
import play.api.Play.current

trait OnwardJourneyLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("OnwardJourneyAgentsRefreshJob")
    Jobs.deschedule("OnwardJourneyAgentsRefresh5MinsJob")

    // fire every min
    Jobs.schedule("OnwardJourneyAgentsRefreshJob",  "0 * * * * ?") {
      LatestContentAgent.update()
      MostPopularAgent.refresh()
      MostPopularExpandableAgent.refresh()
      GeoMostPopularAgent.refresh()
    }

    // fire every 5 mins
    Jobs.schedule("OnwardJourneyAgentsRefresh5MinsJob",  "0 */5 * * * ?") {
      DayMostPopularAgent.refresh()
    }

    if (Play.isDev) {
      LatestContentAgent.update()
      MostPopularAgent.refresh()
      MostPopularExpandableAgent.refresh()
      GeoMostPopularAgent.refresh()
      DayMostPopularAgent.refresh()
    }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("OnwardJourneyAgentsRefreshJob")

    LatestContentAgent.stop()
    MostPopularAgent.stop()
    MostPopularExpandableAgent.stop()
    GeoMostPopularAgent.stop()
    DayMostPopularAgent.stop()

    super.onStop(app)
  }
}
