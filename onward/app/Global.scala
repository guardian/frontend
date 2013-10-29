import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import feed.OnwardJourneyLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with OnwardJourneyLifecycle with DevParametersLifecycle
