import conf.RequestMeasurementMetrics
import feed.MostPopularAgent
import play.api.mvc.WithFilters
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

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with MostPopularLifecycle
