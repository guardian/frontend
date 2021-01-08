package model.diagnostics.analytics

import common.GuLogging
import metrics.CountMetric

object Metric extends GuLogging {

  val namespace = "Diagnostics"

  lazy val metrics = Map(
    // page views
    ("pv", CountMetric("kpis-page-views", "raw page views - simple <img> in body, no javascript involved")),
    ("pvg", CountMetric("kpis-analytics-page-views-google", "page view fires after Google Analytics")),
    // ad-render is fired when the commercial js app has loaded an advert.
    ("ad-render", CountMetric("first-ad-rendered", "first-ad-rendered")),
    // ad-wrapper is added to the page through a DFP creative wrapper. This means it can count n times for a page, where n is the number of adverts.
    ("ad-wrapper", CountMetric("dfp-served-ad", "dfp-served-ad")),
    // error pages
    (
      "50x",
      CountMetric("kpis-user-50x", "beacon on the 50x page that tells us that real users are getting 500 errors"),
    ),
    (
      "404",
      CountMetric("kpis-user-404", "beacon on the 404 page that tells us that real users are getting 404 not found"),
    ),
  )
}
