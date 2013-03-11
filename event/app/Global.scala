import conf.RequestMeasurementMetrics
import model.StoryList
import play.api.GlobalSettings
import play.api.mvc.WithFilters

trait StoryLifecycle extends GlobalSettings {

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    StoryList.startup()
  }

  override def onStop(app: play.api.Application) {
    StoryList.shutdown()
    super.onStop(app)
  }
}

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with StoryLifecycle
