package feed

import agents.DeeplyReadAgent

import java.util.concurrent.Executors
import app.LifecycleComponent
import common.{JobScheduler, PekkoAsync}
import model.ApplicationContext
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
)(context: ApplicationContext)
    extends LifecycleComponent {

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
    // If Preview? every hour at 00m:00s
    // Otherwise every 5 minutes 00m:00s, 05m:00s, 10m:00s, etc
    jobs.schedule("MostPopularAgentRefreshJob", if (context.isPreview) "0 0 * * * ?" else "0 0/5 * * * ?") {
      mostPopularAgent.refresh()
    }
    // If Preview? every hour at 01m:00s
    // Otherwise every 5 minutes 01m:00s, 06m:00s, 11m:00s, etc
    jobs.schedule("GeoMostPopularAgentRefreshJob", if (context.isPreview) "0 1 * * * ?" else "0 1/5 * * * ?") {
      geoMostPopularAgent.refresh()
    }
    // If Preview? every hour at 02m:00s
    // Otherwise every 5 minutes 02m:00s, 07m:00s, 12m:00s, etc
    jobs.schedule("DeeplyReadAgentRefreshJob", if (context.isPreview) "0 2 * * * ?" else "0 2/5 * * * ?") {
      deeplyReadAgent.refresh()
    }

    // If Preview? every hour at 03m:00s
    // Otherwise every 30 minutes 03m:00s, 33m:00s, 03m:00s, etc
    jobs.schedule("MostViewedVideoAgentRefreshJob", if (context.isPreview) "0 3 * * * ?" else "0 3/30 * * * ?") {
      mostViewedVideoAgent.refresh()
    }
    // If Preview? every hour at 04m:00s
    // 04m:00s, 34m:00s, 04m:00s, etc
    jobs.schedule("MostViewedAudioAgentRefreshJob", if (context.isPreview) "0 4 * * * ?" else "0 4/30 * * * ?") {
      mostViewedAudioAgent.refresh()
    }
    // If Preview? every hour at 05m:30s
    // Added 30 second offset to avoid conflicting with the jobs that run every 5 minutes
    // Otherwise every 30 minutes 05m:30s, 35m:30s, 05m:30s, etc
    jobs.schedule("MostViewedGalleryAgentRefreshJob", if (context.isPreview) "30 5 * * * ?" else "30 5/30 * * * ?") {
      mostViewedGalleryAgent.refresh()
    }
    // Added 30 second offset to avoid conflicting with the jobs that run every 5 minutes
    // If Preview? every hour at 06m:30s
    // Otherwise every 30 minutes 06m:30s, 36m:30s, 06m:30s, etc
    jobs.schedule("MostReadAgentRefreshJob", if (context.isPreview) "30 6 * * * ?" else "30 6/30 * * * ?") {
      mostReadAgent.refresh()
    }

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
