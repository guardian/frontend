import conf.RequestMeasurementMetrics
import dev.DevParametersLifecycle
import model.MostPopularLifecycle
import play.api.mvc.WithFilters
import play.api.{ Application => PlayApp }




object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with MostPopularLifecycle with DevParametersLifecycle
