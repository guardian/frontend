package feed

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
  geoMostPopularAgent: GeoMostPopularAgent,
  dayMostPopularAgent: DayMostPopularAgent,
  mostPopularAgent: MostPopularAgent,
  mostCommentedAgent: MostCommentedAgent,
  onSocialAgent: OnSocialAgent,
  mostViewedAudioAgent: MostViewedAudioAgent,
  mostViewedGalleryAgent: MostViewedGalleryAgent,
  mostViewedVideoAgent: MostViewedVideoAgent) extends LifecycleComponent {

  implicit val capiClientExecutionContext = ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

  appLifecycle.addStopHook { () => Future {
    descheduleAll()
  }}

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
      mostCommentedAgent.refresh()
      onSocialAgent.refresh()
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
      mostCommentedAgent.refresh()
      onSocialAgent.refresh()

    }
  }
}

class MostReadLifecycle(
 appLifecycle: ApplicationLifecycle,
 jobs: JobScheduler,
 akkaAsync: AkkaAsync,
 mostPopularAgent: MostPopularAgent,
 mostCommentedAgent: MostCommentedAgent,
 onSocialAgent: OnSocialAgent,
) extends LifecycleComponent {

  implicit val capiClientExecutionContext = ExecutionContext.fromExecutorService(Executors.newSingleThreadExecutor())

  appLifecycle.addStopHook { () => Future {
    descheduleAll()
  }}

  private def descheduleAll(): Unit = {
    jobs.deschedule("MostPopularRefreshJob")
  }

  override def start(): Unit = {

    descheduleAll()

    jobs.scheduleEveryNMinutes("MostPopularRefreshJob", 5) {
      mostPopularAgent.refresh()
      mostCommentedAgent.refresh()
      onSocialAgent.refresh()
    }

    akkaAsync.after1s {
      mostPopularAgent.refresh()
      mostCommentedAgent.refresh()
      onSocialAgent.refresh()

    }
  }
}
