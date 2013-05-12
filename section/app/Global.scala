import conf.RequestMeasurementMetrics
import contentapi.ApacheHttpLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with ApacheHttpLifecycle