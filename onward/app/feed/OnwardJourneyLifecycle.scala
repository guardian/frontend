package feed

import common.{AkkaAsync, Jobs}
import play.api.{ Application => PlayApp, GlobalSettings }

trait OnwardJourneyLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)

    Jobs.deschedule("OnwardJourneyAgentsRefreshJob")
    Jobs.deschedule("OnwardJourneyAgentsRefreshHourlyJob")

      // fire every min
      Jobs.schedule("OnwardJourneyAgentsRefreshJob", "0 * * * * ?") {
        LatestContentAgent.update()
        MostPopularAgent.refresh()
        MostPopularExpandableAgent.refresh()
        GeoMostPopularAgent.refresh()
      }

      // fire every hour
      Jobs.schedule("OnwardJourneyAgentsRefreshHourlyJob", "0 0 * * * ?") {
        DayMostPopularAgent.refresh()
      }

      AkkaAsync {
        LatestContentAgent.update()
        MostPopularAgent.refresh()
        MostPopularExpandableAgent.refresh()
        GeoMostPopularAgent.refresh()
      }

      AkkaAsync{
        // kick off refresh now, as this happens hourly
        DayMostPopularAgent.refresh()
      }
  }

  override def onStop(app: PlayApp) {
    Jobs.deschedule("OnwardJourneyAgentsRefreshJob")
    Jobs.deschedule("OnwardJourneyAgentsRefreshHourlyJob")

    LatestContentAgent.stop()
    MostPopularAgent.stop()
    MostPopularExpandableAgent.stop()
    GeoMostPopularAgent.stop()
    DayMostPopularAgent.stop()

    super.onStop(app)
  }
}
