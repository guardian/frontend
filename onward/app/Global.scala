import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with DevParametersLifecycle
