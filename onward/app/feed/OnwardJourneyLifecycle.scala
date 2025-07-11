package feed

import agents.DeeplyReadAgent

import java.util.concurrent.Executors
import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import play.api.inject.ApplicationLifecycle

import scala.concurrent.{ExecutionContext, ExecutionContextExecutorService, Future}

class OnwardJourneyLifecycle(
    appLifecycle: ApplicationLifecycle,
    jobs: JobScheduler,
    pekkoAsync: PekkoAsync,
    mostReadAgent: MostReadAgent,
    geoMostPopularAgent: GeoMostPopularAgent,
    dayMostPopularAgent: DayMostPopularAgent,
    mostPopularAgent: MostPopularAgent,
    mostViewedAudioAgent: MostViewedAudioAgent,
    mostViewedGalleryAgent: MostViewedGalleryAgent,
    mostViewedVideoAgent: MostViewedVideoAgent,
    deeplyReadAgent: DeeplyReadAgent,
) extends LifecycleComponent {

  implicit val capiClientExecutionContext: ExecutionContextExecutorService =
    ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

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

    // Spreading the jobs in a way that they all run have 30 seconds apart from each others
    // Every 5 minutes
    jobs.schedule("MostPopularAgentRefreshJob", "0 0/5 * * * ?") { mostPopularAgent.refresh() }
    jobs.schedule("GeoMostPopularAgentRefreshJob", "0 1/5 * * * ?") { geoMostPopularAgent.refresh() }
    jobs.schedule("DeeplyReadAgentRefreshJob", "0 2/5 * * * ?") { deeplyReadAgent.refresh() }

    // Every 30 minutes
    jobs.schedule("MostViewedVideoAgentRefreshJob", "0 3/30 * * * ?") { mostViewedVideoAgent.refresh() }
    jobs.schedule("MostViewedAudioAgentRefreshJob", "0 4/30 * * * ?") { mostViewedAudioAgent.refresh() }
    jobs.schedule("MostViewedGalleryAgentRefreshJob", "30 5/30 * * * ?") { mostViewedGalleryAgent.refresh() }
    jobs.schedule("MostReadAgentRefreshJob", "30 6/30 * * * ?") { mostReadAgent.refresh() }

    // Every 60 minutes
    jobs.schedule("DayMostPopularAgentRefreshJob", "30 7/60 * * * ?") { dayMostPopularAgent.refresh() }

    pekkoAsync.after1s {
      mostPopularAgent.refresh()
      deeplyReadAgent.refresh()
      geoMostPopularAgent.refresh()
      dayMostPopularAgent.refresh()
      mostViewedAudioAgent.refresh()
      mostViewedGalleryAgent.refresh()
      mostViewedVideoAgent.refresh()
      mostReadAgent.refresh()
    }
  }
}
