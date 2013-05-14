import conf.RequestMeasurementMetrics
import contentapi.ApacheHttpLifecycle
import controllers.front._
import play.api.mvc.WithFilters


object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with ApacheHttpLifecycle  with FrontLifecycle
