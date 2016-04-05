package app

import commercial.CommercialLifecycle
import common._
import conf.{CorsErrorHandler, Filters, SwitchboardLifecycle}
import dev.DevParametersLifecycle
import metrics.MetricUploader
import play.api.mvc.WithFilters

object Global extends WithFilters(Filters.common: _*)
  with CommercialLifecycle
  with DevParametersLifecycle
  with SwitchboardLifecycle
  with CloudWatchApplicationMetrics
  with CorsErrorHandler {
  override lazy val applicationName = "frontend-commercial"

  val commercialMetrics = MetricUploader("Commercial")
}
