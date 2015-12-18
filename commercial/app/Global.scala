import commercial.CommercialLifecycle
import common._
import conf.{CorsErrorHandler, Filters, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import play.api.mvc.WithFilters
import play.api.{Application => PlayApp}

object Global extends WithFilters(Filters.common: _*)
  with CommercialLifecycle
  with DevParametersLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-commercial"
}
