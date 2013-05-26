import conf.RequestMeasurementMetrics
import play.api.{Application, GlobalSettings}
import play.api.mvc.WithFilters


object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*)