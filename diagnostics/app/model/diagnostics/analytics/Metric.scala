package model.diagnostics.analytics

import common.Logging
import java.util.concurrent.atomic.AtomicLong

object Metric extends Logging {

  case class CountMetric(namespace: String, name: String) {
    val count = new AtomicLong(0)
  }

  lazy val metrics = Map(
    ("pv", CountMetric("kpis", "page-views")),            // raw page views - simple <img> in body, no javascript involved
    ("pva", CountMetric("kpis", "analytics-page-views"))  // page view fires after analytics
  )
}
