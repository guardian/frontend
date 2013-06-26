import conf.RequestMeasurementMetrics
import controllers.front._
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters


object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with FrontLifecycle with DevParametersLifecycle
