package model.diagnostics.analytics

import java.util.concurrent.atomic.AtomicLong

import common.Logging
import conf.Switches

object Metric extends Logging {

  case class CountMetric(name: String) {
    val count = new AtomicLong(0)
  }

  lazy val namespace = "Diagnostics"

  lazy val switch = Switches.BrowserStorageStatsSwitch // remove *Storage-* metrics when this switch is removed
  lazy val metrics = Map(

    // page views
    ("pv", CountMetric("kpis-page-views")),            // raw page views - simple <img> in body, no javascript involved
    ("pva", CountMetric("kpis-analytics-page-views")), // page view fires after analytics

    // for BrowserStorageStatsSwitch work only
    ("localStorage-supported", CountMetric("localStorage-supported")),
    ("localStorage-broken", CountMetric("localStorage-broken")),
    ("localStorage-unsupported", CountMetric("localStorage-unsupported")),
    ("sessionStorage-supported", CountMetric("sessionStorage-supported")),
    ("sessionStorage-broken", CountMetric("sessionStorage-broken")),
    ("sessionStorage-unsupported", CountMetric("sessionStorage-unsupported")),

    // error pages
    ("50x", CountMetric("kpis-user-50x")),             // beacon on the 50x page that tells us that real users are getting 500 errors
    ("404", CountMetric("kpis-user-404"))              // beacon on the 404 page that tells us that real users are getting 404 not found
  )
}
