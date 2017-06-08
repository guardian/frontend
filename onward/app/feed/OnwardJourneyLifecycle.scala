package feed

import app.LifecycleComponent
import common.{JobScheduler, AkkaAsync}
import play.api.inject.ApplicationLifecycle
import scala.concurrent.{Future, ExecutionContext}

class OnwardJourneyLifecycle(
  appLifecycle: ApplicationLifecycle,
  jobs: JobScheduler,
  akkaAsync: AkkaAsync,
  geoMostPopularAgent: GeoMostPopularAgent,
  dayMostPopularAgent: DayMostPopularAgent,
  mostPopularAgent: MostPopularAgent,
  mostViewedAudioAgent: MostViewedAudioAgent,
  mostViewedGalleryAgent: MostViewedGalleryAgent,
  mostViewedVideoAgent: MostViewedVideoAgent)(implicit ec: ExecutionContext) extends LifecycleComponent {

  appLifecycle.addStopHook { () => Future {
    stop()
  }}

  override def start(): Unit = {
    jobs.deschedule("OnwardJourneyAgentsRefreshJob")
    jobs.deschedule("OnwardJourneyAgentsRefreshHourlyJob")

    // fire every min
    jobs.schedule("OnwardJourneyAgentsRefreshJob", "0 * * * * ?") {
      mostPopularAgent.refresh()
      geoMostPopularAgent.refresh()
      mostViewedVideoAgent.refresh()
      mostViewedAudioAgent.refresh()
      mostViewedGalleryAgent.refresh()
    }

    // fire every hour
    jobs.schedule("OnwardJourneyAgentsRefreshHourlyJob", "0 0 * * * ?") {
      dayMostPopularAgent.refresh()
    }

    akkaAsync.after1s {
      mostPopularAgent.refresh()
      geoMostPopularAgent.refresh()
      mostViewedVideoAgent.refresh()
      mostViewedAudioAgent.refresh()
      mostViewedGalleryAgent.refresh()
      dayMostPopularAgent.refresh()
    }
  }

  def stop(): Unit = {
    jobs.deschedule("OnwardJourneyAgentsRefreshJob")
    jobs.deschedule("OnwardJourneyAgentsRefreshHourlyJob")
  }
}
