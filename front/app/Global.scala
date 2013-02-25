import conf.RequestMeasurementMetrics
import controllers.front.Front
import play.api.GlobalSettings
import play.api.mvc.WithFilters

trait FrontLifecycle extends GlobalSettings {

  override def onStart(app: play.api.Application) {
    super.onStart(app)
    Front.startup()
  }

  override def onStop(app: play.api.Application) {
    Front.shutdown()
    super.onStop(app)
  }
}


object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*)  with FrontLifecycle
