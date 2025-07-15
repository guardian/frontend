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
    jobs.deschedule("MostPopularAgentRefreshJob")
    jobs.deschedule("GeoMostPopularAgentRefreshJob")
    jobs.deschedule("DeeplyReadAgentRefreshJob")

    jobs.deschedule("MostViewedVideoAgentRefreshJob")
    jobs.deschedule("MostViewedAudioAgentRefreshJob")
    jobs.deschedule("MostViewedGalleryAgentRefreshJob")
    jobs.deschedule("MostReadAgentRefreshJob")

    jobs.deschedule("DayMostPopularAgentRefreshJob")
  }

  override def start(): Unit = {

    descheduleAll()

    // Spreading the jobs to avoid running them all simultaneously
    // Every 5 minutes
    // 00m:00s, 05m:00s, 10m:00s, etc
    jobs.schedule("MostPopularAgentRefreshJob", "0 0/5 * * * ?") { mostPopularAgent.refresh() }
    // 01m:00s, 06m:00s, 11m:00s, etc
    jobs.schedule("GeoMostPopularAgentRefreshJob", "0 1/5 * * * ?") { geoMostPopularAgent.refresh() }
    // 01m:00s, 06m:00s, 11m:00s, etc
    jobs.schedule("DeeplyReadAgentRefreshJob", "0 2/5 * * * ?") { deeplyReadAgent.refresh() }

    // Every 30 minutes
    // 03m:00s, 33m:00s, 03m:00s, etc
    jobs.schedule("MostViewedVideoAgentRefreshJob", "0 3/30 * * * ?") { mostViewedVideoAgent.refresh() }
    // 04m:00s, 34m:00s, 04m:00s, etc
    jobs.schedule("MostViewedAudioAgentRefreshJob", "0 4/30 * * * ?") { mostViewedAudioAgent.refresh() }
    // Added 30 second offset to avoid conflicting with the jobs that run every 5 minutes
    // 05m:30s, 35m:30s, 05m:30s, etc
    jobs.schedule("MostViewedGalleryAgentRefreshJob", "30 5/30 * * * ?") { mostViewedGalleryAgent.refresh() }
    // Added 30 second offset to avoid conflicting with the jobs that run every 5 minutes
    // 06m:30s, 36m:30s, 06m:30s, etc
    jobs.schedule("MostReadAgentRefreshJob", "30 6/30 * * * ?") { mostReadAgent.refresh() }

    // Every 60 minutes
    // Added 30 second offset to avoid conflicting with the jobs that run every 5 minutes
    // 07m:30s, 37m:30s, 07m:30s, etc
    jobs.schedule("DayMostPopularAgentRefreshJob", "30 7 * * * ?") { dayMostPopularAgent.refresh() }

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
