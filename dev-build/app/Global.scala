import conf.RequestMeasurementMetrics
import controllers.front.FrontLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with MostPopularLifecycle with FrontLifecycle with StoryLifecycle
