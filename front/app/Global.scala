import conf.RequestMeasurementMetrics
import controllers.front._
import play.api.mvc.WithFilters


object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*)  with FrontLifecycle
