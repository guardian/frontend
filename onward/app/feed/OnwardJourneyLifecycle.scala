package feed

import agents.DeeplyReadAgent

import java.util.concurrent.Executors
import app.LifecycleComponent
import common.{AkkaAsync, JobScheduler}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, Future}

class OnwardJourneyLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    akkaAsync: AkkaAsync,
    mostReadAgent: MostReadAgent,
    deeplyReadAgent: DeeplyReadAgent,
    geoMostPopularAgent: GeoMostPopularAgent,
    dayMostPopularAgent: DayMostPopularAgent,
    mostPopularAgent: MostPopularAgent,
    mostViewedAudioAgent: MostViewedAudioAgent,
    mostViewedGalleryAgent: MostViewedGalleryAgent,
    mostViewedVideoAgent: MostViewedVideoAgent,
) extends LifecycleComponent {

  implicit val capiClientExecutionContext = ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

  appLifecycle.addStopHook { () =>
    Future {
      descheduleAll()
    }
  }

  private def descheduleAll(): Unit = {
    jobs.deschedule("OnwardJourneyAgentsHighFrequencyRefreshJob")
    jobs.deschedule("OnwardJourneyAgentsMediumFrequencyRefreshJob")
    jobs.deschedule("OnwardJourneyAgentsLowFrequencyRefreshJob")
  }

  override def start(): Unit = {

    descheduleAll()

    jobs.scheduleEveryNMinutes("OnwardJourneyAgentsHighFrequencyRefreshJob", 5) {
      mostPopularAgent.refresh()
      geoMostPopularAgent.refresh()
      deeplyReadAgent.refresh()
    }

    jobs.scheduleEveryNMinutes("OnwardJourneyAgentsMediumFrequencyRefreshJob", 30) {
      mostViewedVideoAgent.refresh()
      mostViewedAudioAgent.refresh()
      mostViewedGalleryAgent.refresh()
      mostReadAgent.refresh()
    }

    jobs.scheduleEveryNMinutes("OnwardJourneyAgentsLowFrequencyRefreshJob", 60) {
      dayMostPopularAgent.refresh()
    }

    akkaAsync.after1s {
      mostPopularAgent.refresh()
      geoMostPopularAgent.refresh()
      dayMostPopularAgent.refresh()
      mostViewedAudioAgent.refresh()
      mostViewedGalleryAgent.refresh()
      mostViewedVideoAgent.refresh()
      mostReadAgent.refresh()
    }
  }
}
