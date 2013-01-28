import com.gu.management.play.{ RequestTimer, StatusCounters }
import common.RequestMetrics
import feed.MostPopularAgent
import play.api.{ Application => PlayApp, Play, GlobalSettings }
import play.api.Play.current

trait MostPopularLifecycle extends GlobalSettings {
  override def onStart(app: PlayApp) {
    super.onStart(app)
    MostPopularAgent.startup()

    if (Play.isTest) {
      MostPopularAgent.refresh()
      MostPopularAgent.await()
    }
  }

  override def onStop(app: PlayApp) {
    MostPopularAgent.shutdown()
    super.onStop(app)
  }
}

object Global extends GlobalSettings with RequestTimer with StatusCounters with MostPopularLifecycle {

  import RequestMetrics._

  override val requestTimer = RequestTimingMetric
  override val okCounter = Request200s
  override val errorCounter = Request50xs
  override val notFoundCounter = Request404s
  override val redirectCounter = Request30xs
}