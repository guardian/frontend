import conf.RequestMeasurementMetrics
import contentapi.ApacheHttpLifecycle
import controllers.front.FrontLifecycle
import play.api.mvc.WithFilters

object Global extends WithFilters(RequestMeasurementMetrics.asFilters: _*) with ApacheHttpLifecycle with MostPopularLifecycle with FrontLifecycle with StoryLifecycle
