package feed

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{Future, ExecutionContext}

class OnwardJourneyLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    stop()
  }}

  override def start(): Unit = {
    jobs.deschedule("OnwardJourneyAgentsRefreshJob")
    jobs.deschedule("OnwardJourneyAgentsRefreshHourlyJob")

    // fire every min
    jobs.schedule("OnwardJourneyAgentsRefreshJob", "0 * * * * ?") {
      MostPopularAgent.refresh()
      MostPopularExpandableAgent.refresh()
      GeoMostPopularAgent.refresh()
      MostViewedVideoAgent.refresh()
      MostViewedAudioAgent.refresh()
      MostViewedGalleryAgent.refresh()
    }

    // fire every hour
    jobs.schedule("OnwardJourneyAgentsRefreshHourlyJob", "0 0 * * * ?") {
      DayMostPopularAgent.refresh()
    }

    akkaAsync.after1s {
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
    jobs.deschedule("OnwardJourneyAgentsRefreshJob")
    jobs.deschedule("OnwardJourneyAgentsRefreshHourlyJob")
  }
}
