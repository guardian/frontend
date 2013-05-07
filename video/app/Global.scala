import conf.RequestMeasurementMetrics
import controllers.VideoAdvertAgent
import play.api.{Application, GlobalSettings}
import play.api.mvc.WithFilters



trait VideoAdLifecycle extends GlobalSettings {
  override def onStart(app: Application) {
    super.onStart(app)
    VideoAdvertAgent.start()
  }

  override def onStop(app: Application) {
    VideoAdvertAgent.stop()
    super.onStop(app)
  }
}

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with VideoAdLifecycle