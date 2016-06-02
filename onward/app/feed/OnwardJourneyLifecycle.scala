package feed

import common.{LifecycleComponent, AkkaAsync, Jobs}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class OnwardJourneyLifecycle(appLifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    stop()
  }}

  override def start(): Unit = {
    Jobs.deschedule("OnwardJourneyAgentsRefreshJob")
    Jobs.deschedule("OnwardJourneyAgentsRefreshHourlyJob")

    // fire every min
    Jobs.schedule("OnwardJourneyAgentsRefreshJob", "0 * * * * ?") {
      MostPopularAgent.refresh()
      MostPopularExpandableAgent.refresh()
      GeoMostPopularAgent.refresh()
      MostViewedVideoAgent.refresh()
      MostViewedAudioAgent.refresh()
      MostViewedGalleryAgent.refresh()
    }

    // fire every hour
    Jobs.schedule("OnwardJourneyAgentsRefreshHourlyJob", "0 0 * * * ?") {
      DayMostPopularAgent.refresh()
    }

    AkkaAsync {
      MostPopularAgent.refresh()
      MostPopularExpandableAgent.refresh()
      GeoMostPopularAgent.refresh()
      MostViewedVideoAgent.refresh()
      MostViewedAudioAgent.refresh()
      MostViewedGalleryAgent.refresh()
      DayMostPopularAgent.refresh()
    }
  }

  def stop(): Unit = {
    Jobs.deschedule("OnwardJourneyAgentsRefreshJob")
    Jobs.deschedule("OnwardJourneyAgentsRefreshHourlyJob")
  }
}
